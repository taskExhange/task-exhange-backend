const categoryService = require('../service/category-service');

class CategoryControllers {
  async getAllCategorys(req, res, next) {
    try {
      const categorys = await categoryService.getAllCategorys();
      return res.json(categorys);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async createCategory(req, res, next) {
    try {
      const { value, label } = req.body;
      const userData = await categoryService.createCategory(value, label);
      return res.json(userData);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async removeCategory(req, res, next) {
    try {
      const id = req.params.id;
      const userData = await categoryService.removeCategory(id);
      return res.json(userData);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
}
module.exports = new CategoryControllers();
