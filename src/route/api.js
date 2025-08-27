import { Router } from 'express'
import { registration, login, profileUpdate, profileDetails, viewUserList, getUserByEmail, verifyEmail, verifyOTP, passwordReset } from '../controller/userController.js'
import { addProject, viewProjectList, updateProject, deleteProject } from '../controller/projectController.js'
import { addTopic, viewTopicList, updateTopic, deleteTopic } from '../controller/topicController.js'
import { viewArticleList, updateArticle, deleteArticle } from '../controller/articleController.js'
import { getDashboardData } from '../controller/dashboardController.js'
import Authentication from '../middleware/auth.js'
import checkRole from '../middleware/checkRole.js'



const router=Router()

// User Reg & Login Routes

router.post('/registration', registration)
router.post('/login', login);

// User Profile Routes

router.post('/profileUpdate',Authentication , profileUpdate);
router.post('/profileDetails',Authentication , profileDetails);
router.get('/viewUserList', Authentication , viewUserList);
router.post('/getUserByEmail/:email',Authentication , getUserByEmail);


// User Reset Password Routes

router.get('/verifyEmail/:email', verifyEmail);
router.get('/verifyOTP/:email/:otp', verifyOTP);
router.get('/passwordReset/:email/:otp/:password', passwordReset);

//Project Routes

router.post('/addProject', Authentication , checkRole('admin'), addProject)
router.get('/viewProjectList', Authentication, viewProjectList);
router.put('/updateProject/:id', Authentication , checkRole('admin'), updateProject);
router.delete('/deleteProject/:id', Authentication , checkRole('admin'), deleteProject);

//Topic Routes

router.post('/addTopic', Authentication , checkRole('admin', 'researcher'), addTopic)
router.get('/viewTopicList', Authentication , checkRole('admin', 'researcher', 'writer', 'publisher'), viewTopicList);
router.put('/updateTopic/:id', Authentication , checkRole('admin'), updateTopic);
router.delete('/deleteTopic/:id', Authentication , checkRole('admin'), deleteTopic);

//Article Routes

router.get('/viewArticleList', Authentication , checkRole('admin', 'writer', 'publisher'), viewArticleList);
router.put('/updateArticle/:id', Authentication , checkRole('admin', 'writer', 'publisher'), updateArticle);
router.delete('/deleteArticle/:id', Authentication , checkRole('admin'), deleteArticle);

//Dashboard Routes

router.get('/getDashboardData', Authentication , checkRole('admin'), getDashboardData);


export default router;