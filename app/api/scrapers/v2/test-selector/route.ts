import { NextResponse } from "next/server"
import type { FieldSelector } from "@/types/scraping"

export async function POST(request: Request) {
  try {
    const body: { url: string; selector: FieldSelector } = await request.json()
    const { url, selector } = body

    // Validate required fields
    if (!url || !selector || !selector.selector) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          errors: [{ code: "validation_error", message: "URL and selector are required" }],
        },
        { status: 400 },
      )
    }

    // In a real implementation, this would test the selector against the URL
    // For now, we'll return mock data
    const mockResult = generateMockSelectorResult(selector)

    return NextResponse.json({
      success: true,
      data: mockResult,
      meta: {
        url,
        selector: selector.selector,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Selector test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to test selector",
        errors: [{ code: "test_error", message: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}

function generateMockSelectorResult(selector: FieldSelector) {
  const result: Record<string, any> = {
    matches: Math.floor(Math.random() * 5) + 1,
    elements: [],
    valid: true,
  }

  for (let i = 0; i < result.matches; i++) {
    let value
    switch (selector.type) {
      case "text":
        value = `Sample ${selector.name} ${i + 1}`
        break
      case "link":
        value = `https://example.com/${selector.name.toLowerCase()}/${i + 1}`
        break
      case "email":
        value = `contact${i + 1}@example.com`
        break
      case "phone":
        value = `+1-555-${100 + i}-${1000 + i}`
        break
      case "number":
        value = Math.floor(Math.random() * 1000)
        break
      case "date":
        const date = new Date()
        date.setDate(date.getDate() - i)
        value = date.toISOString()
        break
      default:
        value = `Unknown type: ${selector.type}`
    }

    result.elements.push({
      value,
      html: `<${selector.type === "link" ? "a href='#'" : "span"}>${value}</${selector.type === "link" ? "a" : "span"}>`,
      path: `html > body > div:nth-child(${i + 1}) > ${selector.type === "link" ? "a" : "span"}`,
    })
  }

  return result
}
