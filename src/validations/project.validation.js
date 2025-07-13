const Joi = require('@hapi/joi');

const createProject = {
    body: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        projectPrefix: Joi.string().required(),
        icon: Joi.string(),
        numberOfOnePriority: Joi.number().default(1),
        numberOfTwoPriority: Joi.number().default(1),
    })
}

const getProjects = {
    query: Joi.object().keys({
        search: Joi.string(),
        limit: Joi.number().min(1),
        page: Joi.number().min(1),
    })
}

const getProject = {
    params: Joi.object().keys({
        projectId: Joi.number().required(),
    })
}

const updateProject = {
    params: Joi.object().keys({
        projectId: Joi.number().required(),
    }),
    body: Joi.object({
        name: Joi.string(),
        description: Joi.string(),
        projectPrefix: Joi.string(),
        icon: Joi.string(),
        numberOfOnePriority: Joi.number(),
        numberOfTwoPriority: Joi.number(),
    })
}

const deleteProject = {
    params: Joi.object().keys({
        projectId: Joi.number().required(),
    })
}

module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject
}