import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const body = await request.json()

    // Get gap analysis data
    const { data: analysis, error: analysisError } = await supabase
      .from("gap_analyses")
      .select(`
        *,
        contacts(*),
        discovered_companies(*)
      `)
      .eq("id", params.id)
      .single()

    if (analysisError || !analysis) {
      return NextResponse.json({ error: "Gap analysis not found" }, { status: 404 })
    }

    // Generate letter using AI
    const generatedLetter = await generateSalesLetter(analysis, body.provider || "openai")

    // Update gap analysis with generated letter
    const { data: updatedAnalysis, error: updateError } = await supabase
      .from("gap_analyses")
      .update({
        generated_letter: generatedLetter.content,
        ai_provider: generatedLetter.provider,
        generation_prompt: generatedLetter.prompt,
        generation_metadata: generatedLetter.metadata,
        status: "generated",
        regeneration_count: analysis.regeneration_count + 1,
        last_regenerated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log generation for analytics
    await supabase.from("ai_generation_logs").insert({
      gap_analysis_id: params.id,
      provider: generatedLetter.provider,
      model_used: generatedLetter.model,
      prompt_used: generatedLetter.prompt,
      response_received: generatedLetter.content,
      generation_time_ms: generatedLetter.generation_time,
      token_count: generatedLetter.token_count,
      status: "completed",
    })

    return NextResponse.json({
      analysis: updatedAnalysis,
      letter: generatedLetter.content,
    })
  } catch (error) {
    console.error("Error generating letter:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generateSalesLetter(analysis: any, provider: string) {
  const startTime = Date.now()

  try {
    // Build context from analysis data
    const context = {
      company: analysis.discovered_companies?.name || "the company",
      industry: analysis.discovered_companies?.industry || "your industry",
      gaps: analysis.priority_areas || [],
      score: analysis.overall_score || 0,
      responses: analysis.form_responses || {},
    }

    const prompt = buildPrompt(context, analysis.analysis_type)

    // Try AI providers in order of preference
    let result = null

    if (provider === "openai" && process.env.OPENAI_API_KEY) {
      result = await generateWithOpenAI(prompt)
    } else if (provider === "claude" && process.env.ANTHROPIC_API_KEY) {
      result = await generateWithClaude(prompt)
    }

    // Fallback to template-based generation
    if (!result) {
      result = generateWithTemplate(context, analysis.analysis_type)
      provider = "template_fallback"
    }

    return {
      content: result.content,
      provider,
      model: result.model || "template",
      prompt,
      metadata: result.metadata || {},
      generation_time: Date.now() - startTime,
      token_count: result.token_count || 0,
    }
  } catch (error) {
    console.error("Error in letter generation:", error)

    // Ultimate fallback
    const context = {
      company: analysis.discovered_companies?.name || "your company",
      score: analysis.overall_score || 0,
    }

    return {
      content: generateWithTemplate(context, analysis.analysis_type).content,
      provider: "template_fallback",
      model: "template",
      prompt: "Fallback template generation",
      metadata: { error: error.message },
      generation_time: Date.now() - startTime,
      token_count: 0,
    }
  }
}

function buildPrompt(context: any, analysisType: string) {
  return `
Generate a personalized sales letter based on the following gap analysis:

Company: ${context.company}
Industry: ${context.industry}
Analysis Type: ${analysisType}
Overall Score: ${context.score}/5
Priority Areas: ${context.gaps.join(", ")}

Key Findings:
${Object.entries(context.responses)
  .map(([q, a]) => `- ${q}: ${a}`)
  .join("\n")}

Create a professional, personalized sales letter that:
1. Acknowledges their current situation
2. Highlights specific gaps identified
3. Presents solutions without being pushy
4. Includes a clear call-to-action
5. Maintains a consultative tone

Keep it concise (300-500 words) and actionable.
`
}

async function generateWithOpenAI(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  })

  const data = await response.json()

  return {
    content: data.choices[0].message.content,
    model: "gpt-4",
    token_count: data.usage?.total_tokens || 0,
    metadata: { finish_reason: data.choices[0].finish_reason },
  }
}

async function generateWithClaude(prompt: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  const data = await response.json()

  return {
    content: data.content[0].text,
    model: "claude-3-sonnet",
    token_count: data.usage?.input_tokens + data.usage?.output_tokens || 0,
    metadata: { stop_reason: data.stop_reason },
  }
}

function generateWithTemplate(context: any, analysisType: string) {
  const templates = {
    business_assessment: `
Dear ${context.company} Team,

I hope this message finds you well. I recently completed an analysis of your current business operations and wanted to share some insights that could be valuable for your growth.

Based on my assessment, I've identified several areas where ${context.company} has strong foundations, as well as some opportunities for improvement. Your current performance score of ${context.score}/5 indicates solid potential with room for strategic enhancement.

Key areas I'd recommend focusing on:
• Process optimization to improve efficiency
• Technology integration for better scalability  
• Strategic planning for sustainable growth

I'd love to discuss these findings in more detail and explore how we might work together to address these opportunities. Would you be open to a brief 15-minute conversation this week?

Best regards,
[Your Name]
    `,
    technical_audit: `
Hello ${context.company} Team,

Following our technical assessment, I wanted to share some key findings that could significantly impact your operational efficiency and security posture.

Your current technical score of ${context.score}/5 reveals both strengths and critical areas for improvement. The good news is that most of these gaps can be addressed with the right strategy and implementation.

Priority recommendations:
• Infrastructure modernization for improved performance
• Security enhancements to protect your data and systems
• Automation opportunities to reduce manual overhead

These improvements could potentially save you significant time and resources while reducing risk. I'd be happy to discuss a roadmap for implementing these changes.

Could we schedule a brief call to explore how these improvements might benefit ${context.company}?

Best regards,
[Your Name]
    `,
  }

  return {
    content: templates[analysisType as keyof typeof templates] || templates.business_assessment,
    model: "template",
    metadata: { template_used: analysisType },
  }
}
