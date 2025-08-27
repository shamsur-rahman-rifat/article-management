// topicController.js (ES Module)

import topicModel from '../model/Topic.js';
import Article from '../model/Article.js';

export const addTopic = async (req, res) => {
  try {
    const reqBody = req.body;
    const createdBy = req.headers['email'];
    reqBody.createdBy = createdBy;
    reqBody.researchSubmittedAt = new Date();

    await topicModel.create(reqBody);
    res.json({ status: 'Success', message: 'Topic Added' });
  } catch (error) {
    res.json({ status: 'Failed', message: error });
  }
};

export const viewTopicList = async (req, res) => {
  try {
    const result = await topicModel.find();
    res.json({ status: 'Success', data: result });
  } catch (error) {
    res.json({ status: 'Failed', message: error });
  }
};

export const updateTopic = async (req, res) => {
  try {
    const reqBody = req.body;
    const { id } = req.params;
    const createdBy = req.headers['email'];
    reqBody.createdBy = createdBy;

    // Fetch current topic to compare
    const currentTopic = await topicModel.findById(id);

    // If status changes to assigned or assignedTo changes
    if (
      (reqBody.status === 'assigned' && currentTopic.status !== 'assigned') ||
      (reqBody.assignedTo && !currentTopic.assignedTo)
    ) {
      reqBody.adminAssignedAt = new Date();
    }

    // Update the topic document
    const updateResult = await topicModel.updateOne({ _id: id }, reqBody);
    if (updateResult.modifiedCount === 0) {
      return res
        .status(404)
        .json({ status: 'Failed', message: 'Topic not found or not authorized' });
    }

    // Fetch the updated topic
    const updatedTopic = await topicModel.findById(id);

    // If topic assigned to writer, create Article if not exists
    if (updatedTopic.status === 'assigned' && updatedTopic.assignedTo) {
      const existingArticle = await Article.findOne({ topic: id });
      if (!existingArticle) {
        const newArticle = new Article({
          topic: id,
          project: updatedTopic.project,
          writer: updatedTopic.assignedTo.toString(),
          status: 'assigned',
        });
        await newArticle.save();
      }
    }

    res.json({ status: 'Success', message: 'Topic Updated and Article created if assigned' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'Failed', message: error.message || error });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const createdBy = req.headers['email'];
    await topicModel.deleteOne({ _id: id, createdBy });
    res.json({ status: 'Success', message: 'Topic Deleted' });
  } catch (error) {
    res.json({ status: 'Failed', message: error });
  }
};
