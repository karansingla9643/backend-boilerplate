const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const db = require('../db/models');

async function getProjectById(projectId, options = {
    fields: ['id', 'name', 'description', 'projectPrefix', 'icon', 'numberOfOnePriority', 'numberOfTwoPriority'],
    include: [{}],
}) {

    const project = await db.project.findOne({
        where: { id: projectId },
        attributes: options.fields,
    });
    return project;
}


async function getProjects(options, filter) {
    const projects = await db.project.paginate(filter, options);
    return projects;
}

const deleteProjectById = async (projectId) => {
    const deletedProject = await db.project.destroy({
        where: { id: projectId },
    });
    return deletedProject;
}

const updateProjectById = async (projectId, projectBody) => {
    const updatedProject = await db.project.update(projectBody, {
        where: { id: projectId },
    });
    return updatedProject;
}

const createProject = async (projectBody) => {
    console.log(projectBody);
    const createdProject = await db.project.create(projectBody);
    return createdProject;
}

module.exports = {
    getProjectById,
    getProjects,
    deleteProjectById,
    updateProjectById,
    createProject,
}
