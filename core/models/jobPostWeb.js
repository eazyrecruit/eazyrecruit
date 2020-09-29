module.exports = sequelizeConnInstance.define('job_post_web', {
    job_post_id: Sequelize.INTEGER,
    is_published: Sequelize.BOOLEAN,
    meta_image: Sequelize.STRING,
    meta_text: Sequelize.STRING,
    created_by: Sequelize.INTEGER,
    modified_by: Sequelize.INTEGER,
    created_at: Sequelize.DATE(),
    modified_at: Sequelize.DATE(),
    is_deleted: Sequelize.BOOLEAN,
});