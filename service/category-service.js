const CategoryModel = require('../models/category-model');
const ApiError = require('../exception/api-error');

class CategoryService {
  async getAllCategorys() {
    const categorys = await CategoryModel.find();
    return categorys;
  }
  async createCategory(title, slug) {
    if (!title || !slug) {
      throw new Error('Поле title та slug не должны быть пустыми');
    }

    const items = await CategoryModel.findOne({ title });

    if (items) {
      throw ApiError.BadRequest(`Такая категоря уже существует`);
    }

    const response = await CategoryModel.create({ title, slug });

    if (!response) {
      throw ApiError.BadRequest('Не удалось создать категорию');
    } else {
      const items = await CategoryModel.find();
      return { message: 'Категория создана', items };
    }
  }

  async removeCategory(id) {
    const items = await CategoryModel.findOne({ _id: id });
    if (!items) {
      throw ApiError.BadRequest(`Такої категорії немає`);
    }
    const response = await CategoryModel.deleteOne({ _id: id });

    if (!response) {
      throw ApiError.BadRequest('Не удалось удалить категорию');
    } else {
      const items = await CategoryModel.find();
      return { message: 'Категория удалена', items };
    }
  }
}

module.exports = new CategoryService();
