import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const url = req.query['url']
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing required query parameter: url' })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return res.status(400).json({ error: 'Invalid URL.' })
  }

  // Only allow http/https — block file://, javascript:, etc.
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only http and https URLs are allowed.' })
  }

  try {
    const response = await fetch(url, {
      headers: {
        // Mimic a real browser to avoid bot-blocking on recipe sites
        'User-Agent':
          'Mozilla/5.0 (compatible; RecipeStreamliner/1.0; +https://recipe-streamliner.vercel.app)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: `Failed to fetch URL: ${response.status} ${response.statusText}` })
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return res.status(422).json({ error: `Unsupported content type: ${contentType}` })
    }

    const html = await response.text()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(html)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: `Fetch failed: ${message}` })
  }
}
