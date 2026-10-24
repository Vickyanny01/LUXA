import { SearchIntent, ProductCategory } from '../src/types/index.js';

const VALID_CATEGORIES: ProductCategory[] = [
  'Phones and Gadgets',
  'Computers',
  'Fashion',
  'Home and Living',
  'Beauty',
  'Groceries',
  'Accessories',
  'Appliances',
  'Other',
];

export async function parseSearchIntent(
  query: string,
  userLocationDefault: { state?: string; city?: string } = { state: 'Ekiti', city: 'Ado-Ekiti' }
): Promise<SearchIntent> {
  const cleaned = (query || '').trim();
  if (!cleaned) {
    return createEmptyIntent();
  }

  // 1. Try Gemma AI if configured
  if (process.env.GEMMA_API_URL && process.env.GEMMA_API_KEY) {
    try {
      const gemmaResult = await callGemmaModel(cleaned, userLocationDefault);
      if (gemmaResult) {
        return gemmaResult;
      }
    } catch (err) {
      console.warn('[LUXA AI] Gemma API call failed or timed out. Falling back to secondary/rule parser:', err);
    }
  }

  // 2. Try Gemini API if available
  if (process.env.GEMINI_API_KEY) {
    try {
      const geminiResult = await callGeminiModel(cleaned, userLocationDefault);
      if (geminiResult) {
        return geminiResult;
      }
    } catch (err) {
      console.warn('[LUXA AI] Gemini API call failed. Falling back to rule parser:', err);
    }
  }

  // 3. Fallback: Robust Nigerian Market Rule-based Intent Parser
  return parseIntentWithRuleEngine(cleaned, userLocationDefault);
}

function createEmptyIntent(): SearchIntent {
  return {
    original_query: '',
    intent: 'product_discovery',
    product_category: 'All',
    keywords: [],
    synonyms: [],
    min_price: null,
    max_price: null,
    currency: 'NGN',
    location: {},
    requested_specifications: {},
    sorting_preferences: 'relevance',
    parser_used: 'rule_fallback',
    parser_notes: 'Empty query',
    is_fallback: true,
  };
}

/**
 * Gemma AI Provider Adapter
 * Connects to any standard Gemma OpenAI-compatible or HuggingFace inference endpoint
 */
async function callGemmaModel(
  query: string,
  userLocationDefault: { state?: string; city?: string }
): Promise<SearchIntent | null> {
  const url = process.env.GEMMA_API_URL!;
  const apiKey = process.env.GEMMA_API_KEY!;
  const modelId = process.env.GEMMA_MODEL_ID || 'gemma-2-9b-it';

  const systemPrompt = `You are LUXA's AI Product Discovery Parser for the Nigerian market (especially Ekiti State and nationwide).
Extract structured search criteria from the user's natural language request.
Return strictly valid JSON matching this schema:
{
  "intent": "product_discovery" | "price_comparison" | "seller_lookup" | "availability_check",
  "product_category": "Phones and Gadgets" | "Computers" | "Fashion" | "Home and Living" | "Beauty" | "Groceries" | "Accessories" | "Appliances" | "Other" | "All",
  "keywords": ["keyword1", "keyword2"],
  "synonyms": ["synonym1"],
  "use_case": "optional use case description",
  "min_price": number or null,
  "max_price": number or null,
  "currency": "NGN",
  "location": { "state": "e.g. Ekiti", "city": "e.g. Ado-Ekiti" },
  "requested_specifications": { "attribute": "value" },
  "delivery_preferences": "string or null",
  "sorting_preferences": "relevance" | "lowest_price" | "highest_price" | "recently_updated",
  "clarification_needed": "string or null"
}
Do not add markdown formatting or commentary outside JSON.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Gemma endpoint returned ${res.status}`);

    const data = (await res.json()) as any;
    const content = data.choices?.[0]?.message?.content || data.generated_text || '';
    const parsed = extractJson(content);
    if (parsed) {
      return {
        ...parsed,
        original_query: query,
        currency: parsed.currency || 'NGN',
        parser_used: 'gemma',
        parser_notes: `Parsed via Gemma (${modelId}) inference endpoint`,
        is_fallback: false,
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
  return null;
}

/**
 * Gemini AI Model Adapter
 */
async function callGeminiModel(
  query: string,
  userLocationDefault: { state?: string; city?: string }
): Promise<SearchIntent | null> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are LUXA's AI Product Discovery Parser for the Nigerian retail and commerce market (especially Ado-Ekiti, Ekiti State, and nationwide).
Parse this user shopping/product discovery request into structured JSON:
User query: "${query}"

Return ONLY a raw JSON object with these keys:
{
  "intent": "product_discovery" or "price_comparison" or "seller_lookup" or "availability_check",
  "product_category": "Phones and Gadgets" | "Computers" | "Fashion" | "Home and Living" | "Beauty" | "Groceries" | "Accessories" | "Appliances" | "Other" | "All",
  "keywords": ["array", "of", "search", "terms"],
  "synonyms": ["synonyms", "or", "alternate", "terms"],
  "use_case": "concise use case, e.g. music production, home vocals, gaming",
  "min_price": number or null,
  "max_price": number or null,
  "currency": "NGN",
  "location": { "state": "Ekiti or other", "city": "Ado-Ekiti or other" },
  "requested_specifications": { "ram": "16GB", "type": "wireless" },
  "delivery_preferences": null or string,
  "sorting_preferences": "relevance" or "lowest_price" or "highest_price" or "recently_updated",
  "clarification_needed": null or string
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Gemini API returned ${res.status}`);
    const data = (await res.json()) as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = extractJson(text);
    if (parsed) {
      return {
        ...parsed,
        original_query: query,
        currency: parsed.currency || 'NGN',
        parser_used: 'gemini',
        parser_notes: 'Parsed via Google Gemini 2.5 Flash',
        is_fallback: false,
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
  return null;
}

/**
 * Fallback Natural Language Rule Engine
 * Specially designed for Nigerian retail, locations (Ado-Ekiti, Ekiti, Lagos, etc.), and currency formats
 */
export function parseIntentWithRuleEngine(
  query: string,
  userLocationDefault: { state?: string; city?: string } = { state: 'Ekiti', city: 'Ado-Ekiti' }
): SearchIntent {
  const lower = query.toLowerCase();

  // 1. Detect Intent
  let intent: SearchIntent['intent'] = 'product_discovery';
  if (lower.includes('compare') || lower.includes('vs') || lower.includes('difference in price')) {
    intent = 'price_comparison';
  } else if (lower.includes('who sells') || lower.includes('seller') || lower.includes('store') || lower.includes('shop that sells')) {
    intent = 'seller_lookup';
  } else if (lower.includes('in stock') || lower.includes('available now')) {
    intent = 'availability_check';
  }

  // 2. Detect Prices (e.g. "under 50,000 naira", "below 250k", "50k", "between 30k and 60k", "under ₦50,000")
  let min_price: number | null = null;
  let max_price: number | null = null;

  // Max price matches: "under 50,000", "below 250k", "less than 300,000 naira", "under 50k naira"
  const underMatch = lower.match(/(?:under|below|less than|within|max(?:imum)?)\s*(?:₦|ngn)?\s*([\d,]+(?:\.\d+)?)\s*(k|thousand|million|m)?\s*(?:naira|ngn)?/i);
  if (underMatch) {
    let rawNum = parseFloat(underMatch[1].replace(/,/g, ''));
    const unit = (underMatch[2] || '').toLowerCase();
    if (unit === 'k' || unit === 'thousand') rawNum *= 1000;
    if (unit === 'm' || unit === 'million') rawNum *= 1000000;
    max_price = rawNum;
  }

  // Range matches: "between 30,000 and 70,000", "50k to 100k"
  const rangeMatch = lower.match(/(?:between|from)?\s*(?:₦|ngn)?\s*([\d,]+)\s*(k)?\s*(?:and|to|-)\s*(?:₦|ngn)?\s*([\d,]+)\s*(k)?\s*(?:naira|ngn)?/i);
  if (rangeMatch && !max_price) {
    let low = parseFloat(rangeMatch[1].replace(/,/g, ''));
    if (rangeMatch[2] === 'k') low *= 1000;
    let high = parseFloat(rangeMatch[3].replace(/,/g, ''));
    if (rangeMatch[4] === 'k') high *= 1000;
    min_price = low;
    max_price = high;
  }

  // 3. Detect Nigerian Locations
  const location: { state?: string; city?: string; raw?: string } = {};
  if (lower.includes('ado-ekiti') || lower.includes('ado ekiti') || lower.includes('ado')) {
    location.state = 'Ekiti';
    location.city = 'Ado-Ekiti';
  } else if (lower.includes('ikere') || lower.includes('ikere-ekiti')) {
    location.state = 'Ekiti';
    location.city = 'Ikere-Ekiti';
  } else if (lower.includes('oye-ekiti') || lower.includes('oye')) {
    location.state = 'Ekiti';
    location.city = 'Oye-Ekiti';
  } else if (lower.includes('ekiti')) {
    location.state = 'Ekiti';
    location.city = 'Ado-Ekiti';
  } else if (lower.includes('lagos') || lower.includes('ikeja') || lower.includes('yaba')) {
    location.state = 'Lagos';
    location.city = 'Lagos';
  } else if (lower.includes('abuja')) {
    location.state = 'Abuja (FCT)';
    location.city = 'Abuja';
  } else if (lower.includes('ibadan') || lower.includes('oyo')) {
    location.state = 'Oyo';
    location.city = 'Ibadan';
  } else if (userLocationDefault.state) {
    location.state = userLocationDefault.state;
    location.city = userLocationDefault.city;
  }

  // 4. Detect Category & Use Case
  let product_category: ProductCategory | 'All' = 'All';
  let use_case = '';
  const specs: Record<string, string> = {};
  const synonyms: string[] = [];

  if (
    lower.includes('laptop') ||
    lower.includes('computer') ||
    lower.includes('macbook') ||
    lower.includes('thinkpad') ||
    lower.includes('elitebook') ||
    lower.includes('desktop') ||
    lower.includes('pc')
  ) {
    product_category = 'Computers';
    synonyms.push('notebook', 'pc', 'workstation');
  } else if (
    lower.includes('microphone') ||
    lower.includes('mic') ||
    lower.includes('clean vocals') ||
    lower.includes('audio interface') ||
    lower.includes('soundcard') ||
    lower.includes('sound card')
  ) {
    product_category = 'Accessories';
    synonyms.push('wireless mic', 'condenser mic', 'vocal recorder', 'fifine', 'boya');
    if (lower.includes('wireless')) specs['connectivity'] = 'wireless';
  } else if (
    lower.includes('phone') ||
    lower.includes('iphone') ||
    lower.includes('samsung') ||
    lower.includes('redmi') ||
    lower.includes('infinix') ||
    lower.includes('tecno') ||
    lower.includes('gadget')
  ) {
    product_category = 'Phones and Gadgets';
    synonyms.push('smartphone', 'mobile', 'handset');
  } else if (
    lower.includes('sneaker') ||
    lower.includes('shoe') ||
    lower.includes('clothing') ||
    lower.includes('wear') ||
    lower.includes('shirt') ||
    lower.includes('footwear') ||
    lower.includes('kicks')
  ) {
    product_category = 'Fashion';
    synonyms.push('kicks', 'trainers', 'footwear');
  } else if (
    lower.includes('fan') ||
    lower.includes('inverter') ||
    lower.includes('blender') ||
    lower.includes('microwave') ||
    lower.includes('refrigerator') ||
    lower.includes('generator') ||
    lower.includes('solar')
  ) {
    product_category = 'Appliances';
  } else if (
    lower.includes('soap') ||
    lower.includes('cream') ||
    lower.includes('skincare') ||
    lower.includes('perfume') ||
    lower.includes('oil') ||
    lower.includes('hair')
  ) {
    product_category = 'Beauty';
  } else if (
    lower.includes('chair') ||
    lower.includes('bed') ||
    lower.includes('curtain') ||
    lower.includes('furniture') ||
    lower.includes('cushion')
  ) {
    product_category = 'Home and Living';
  } else if (
    lower.includes('rice') ||
    lower.includes('oil') ||
    lower.includes('groceries') ||
    lower.includes('food') ||
    lower.includes('garri')
  ) {
    product_category = 'Groceries';
  }

  // Detect use-cases
  if (lower.includes('music production') || lower.includes('recording music') || lower.includes('music')) {
    use_case = 'music production';
    specs['suitability'] = 'music production & audio editing';
  } else if (lower.includes('clean vocal') || lower.includes('vocal')) {
    use_case = 'vocal recording';
    specs['target'] = 'clean vocals';
  } else if (lower.includes('gaming')) {
    use_case = 'gaming';
    specs['suitability'] = 'gaming';
  } else if (lower.includes('student') || lower.includes('school')) {
    use_case = 'student academic work';
  }

  if (lower.includes('wireless')) {
    specs['connectivity'] = 'wireless';
  }
  if (lower.includes('affordable') || lower.includes('cheap')) {
    specs['budget_preference'] = 'budget friendly';
  }

  // Extract core keywords
  const stopWords = new Set([
    'i', 'need', 'a', 'an', 'the', 'for', 'in', 'at', 'under', 'below', 'where', 'can',
    'buy', 'find', 'who', 'sells', 'naira', 'ngn', 'help', 'me', 'with', 'to', 'of', 'and'
  ]);

  const rawWords = lower
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w) && !w.match(/^\d+k?$/));

  // Determine sorting preference
  let sorting_preferences: SearchIntent['sorting_preferences'] = 'relevance';
  if (lower.includes('cheapest') || lower.includes('lowest price') || lower.includes('affordable')) {
    sorting_preferences = 'lowest_price';
  } else if (lower.includes('latest') || lower.includes('newest') || lower.includes('recently')) {
    sorting_preferences = 'recently_updated';
  }

  let clarification_needed: string | null = null;
  if (rawWords.length <= 1 && product_category === 'All') {
    clarification_needed = 'Could you specify the type of product or brand you are looking for?';
  }

  return {
    original_query: query,
    intent,
    product_category,
    keywords: rawWords,
    synonyms,
    use_case: use_case || undefined,
    min_price,
    max_price,
    currency: 'NGN',
    location,
    requested_specifications: specs,
    sorting_preferences,
    clarification_needed,
    parser_used: 'rule_fallback',
    parser_notes: 'Parsed via LUXA Nigerian Market Rule Engine (Gemma AI ready when GEMMA_API_URL is configured)',
    is_fallback: true,
  };
}

function extractJson(text: string): any {
  if (!text) return null;
  try {
    const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}
