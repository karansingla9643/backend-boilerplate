const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { projectService } = require('../services');
const { Op } = require('sequelize');
const pick = require('../utils/pick');

const createProject = catchAsync(async (req, res) => {
    const projectBody = req.body;
    const project = await projectService.createProject(projectBody);
    res.status(httpStatus.CREATED).send({ project })
})

const getProjects = catchAsync(async (req, res) => {
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const filter = {}
    if (req.query.search) {
        filter[Op.or] = [
            { name: { [Op.like]: `%${req.query.search}%` } },
            { description: { [Op.like]: `%${req.query.search}%` } },
        ];
    }
    options.fields = ['id', 'name', 'description'];
    const projects = await projectService.getProjects(options, filter);
    res.send({ projects });
})

const getProject = catchAsync(async (req, res) => {
    const project = await projectService.getProjectById(req.params.projectId);
    if (!project) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
    }
    res.send({ project });
})

const updateProject = catchAsync(async (req, res) => {
    const project = await projectService.updateProjectById(req.params.projectId, req.body);
    if (!project) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
    }
    res.send({ project });
})

const deleteProject = catchAsync(async (req, res) => {
    const project = await projectService.deleteProjectById(req.params.projectId);
    if (!project) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Project not found');
    }
    res.status(httpStatus.NO_CONTENT).send();
})

module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject
}