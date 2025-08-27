// dashboardController.js (ES Module)

import Topic from '../model/Topic.js';
import Article from '../model/Article.js';

export const getDashboardData = async (req, res) => {
  try {
    // Step 1: Get topics with required details
    const topics = await Topic.find()
      .populate('project', 'name')
      .lean();

    // Step 2: Get matching articles
    const topicIds = topics.map(t => t._id);
    const articles = await Article.find({ topic: { $in: topicIds } }).lean();

    // Step 3: Map articles by topic ID
    const articleMap = {};
    for (const article of articles) {
      articleMap[article.topic.toString()] = article;
    }

    // Step 4: Merge topic + article data
    const dashboardData = topics.map(topic => {
      const article = articleMap[topic._id.toString()] || {};

      return {
        project: topic.project?.name || 'N/A',
        topic: topic.title,
        month: topic.month,
        researchSubmittedAt: topic.researchSubmittedAt
          ? topic.researchSubmittedAt.toISOString().split('T')[0]
          : null,
        adminAssignedAt: topic.adminAssignedAt
          ? topic.adminAssignedAt.toISOString().split('T')[0]
          : null,
        writerSubmittedAt: article.writerSubmittedAt
          ? new Date(article.writerSubmittedAt).toISOString().split('T')[0]
          : null,
        publishedAt: article.publishedAt
          ? new Date(article.publishedAt).toISOString().split('T')[0]
          : null,
      };
    });

    res.json({ status: 'Success', data: dashboardData });
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    res.status(500).json({ status: 'Failed', message: err.message });
  }
};
