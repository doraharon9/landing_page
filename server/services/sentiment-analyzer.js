import Sentiment from 'sentiment'

/**
 * Sentiment Analyzer
 * Analyzes sentiment of social media posts about restaurants
 */
class SentimentAnalyzer {
  constructor() {
    this.analyzer = new Sentiment()

    // Custom restaurant-related keywords
    this.customLexicon = {
      'delicious': 5,
      'amazing': 4,
      'incredible': 4,
      'perfect': 4,
      'excellent': 4,
      'outstanding': 5,
      'fantastic': 4,
      'wonderful': 3,
      'awesome': 3,
      'great': 3,
      'good': 2,
      'tasty': 3,
      'yummy': 3,
      'scrumptious': 4,
      'divine': 5,
      'heavenly': 5,
      'must-try': 4,
      'recommended': 3,
      'love': 3,
      'best': 4,
      'favorite': 3,
      'gem': 3,
      'hidden gem': 4,

      // Negative keywords
      'disappointing': -3,
      'terrible': -5,
      'horrible': -5,
      'awful': -4,
      'bad': -3,
      'worst': -5,
      'disgusting': -5,
      'bland': -2,
      'overpriced': -3,
      'mediocre': -2,
      'meh': -2,
      'skip': -3,
      'avoid': -4,
      'waste': -4,
      'never again': -5,
      'cold': -2,
      'slow service': -3,
      'rude': -4
    }
  }

  /**
   * Analyze sentiment of a text
   */
  analyze(text) {
    const result = this.analyzer.analyze(text, {
      extras: this.customLexicon
    })

    return {
      score: result.score,
      comparative: result.comparative,
      positive: result.positive,
      negative: result.negative,
      tokens: result.tokens.length,
      sentiment: this.categorizeSentiment(result.score)
    }
  }

  /**
   * Categorize sentiment into levels
   */
  categorizeSentiment(score) {
    if (score >= 5) return 'very positive'
    if (score >= 2) return 'positive'
    if (score >= -1) return 'neutral'
    if (score >= -4) return 'negative'
    return 'very negative'
  }

  /**
   * Calculate social buzz score for a restaurant
   */
  calculateSocialScore(mentions) {
    if (!mentions || mentions.length === 0) return 0

    let totalScore = 0
    let positiveCount = 0
    let neutralCount = 0
    let negativeCount = 0

    mentions.forEach(mention => {
      const sentiment = this.analyze(mention.text)
      const engagementMultiplier = Math.log10((mention.engagementScore || 0) + 10)

      // Weight by engagement
      const weightedScore = sentiment.score * engagementMultiplier

      totalScore += weightedScore

      if (sentiment.score > 1) positiveCount++
      else if (sentiment.score < -1) negativeCount++
      else neutralCount++
    })

    // Calculate final score (0-1000 scale)
    const averageSentiment = totalScore / mentions.length
    const positiveRatio = positiveCount / mentions.length
    const mentionBonus = Math.min(mentions.length * 10, 500)

    const finalScore = Math.max(0, Math.min(1000,
      (averageSentiment * 50) + // Sentiment contribution
      (positiveRatio * 300) + // Positive ratio contribution
      mentionBonus // Mention count bonus
    ))

    return {
      socialScore: Math.round(finalScore),
      mentionCount: mentions.length,
      positiveMentions: positiveCount,
      neutralMentions: neutralCount,
      negativeMentions: negativeCount,
      averageSentiment: Math.round(averageSentiment * 100) / 100,
      positiveRatio: Math.round(positiveRatio * 100)
    }
  }

  /**
   * Extract top positive and negative phrases
   */
  extractTopPhrases(mentions, limit = 5) {
    const positivePhrases = []
    const negativePhrases = []

    mentions.forEach(mention => {
      const sentiment = this.analyze(mention.text)

      // Extract sentences
      const sentences = mention.text.split(/[.!?]+/).filter(s => s.trim().length > 10)

      sentences.forEach(sentence => {
        const sentimentResult = this.analyze(sentence)
        if (sentimentResult.score > 2) {
          positivePhrases.push({
            text: sentence.trim(),
            score: sentimentResult.score
          })
        } else if (sentimentResult.score < -2) {
          negativePhrases.push({
            text: sentence.trim(),
            score: sentimentResult.score
          })
        }
      })
    })

    return {
      topPositive: positivePhrases
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(p => p.text),
      topNegative: negativePhrases
        .sort((a, b) => a.score - b.score)
        .slice(0, limit)
        .map(p => p.text)
    }
  }
}

export default new SentimentAnalyzer()
