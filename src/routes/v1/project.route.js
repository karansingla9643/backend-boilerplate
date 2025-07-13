const express = require('express');
const validate = require('../../middlewares/validate');
const { projectValidation } = require('../../validations');
const { projectController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();

router
    .route('/')
    .get(auth('readProject'), validate(projectValidation.getProjects), projectController.getProjects)
    .post(auth(), validate(projectValidation.createProject), projectController.createProject);

router
    .route('/:projectId')
    .get(auth(), validate(projectValidation.getProject), projectController.getProject)
    .patch(auth(), validate(projectValidation.updateProject), projectController.updateProject)
    .delete(auth(), validate(projectValidation.deleteProject), projectController.deleteProject);

module.exports = router;
