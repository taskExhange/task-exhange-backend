const productService = require('../service/product-service');

class ProductControllers {
  async createProduct(req, res, next) {
    try {
      const { title, description, price, images, category, slug } = req.body;
      const userData = await productService.createProduct(title, description, price, images, category, slug);
      return res.json(userData);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async getProducts(req, res, next) {
    try {
      const category = req.params.category;
      const priceRange = req.query;
      const products = await productService.getAllProducts(category, priceRange);
      return res.json(products);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async getProductsSearch(req, res, next) {
    try {
      const name = req.params.name;
      const products = await productService.getAllProductsSearch(name);
      return res.json(products);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async getProduct(req, res, next) {
    try {
      const slug = req.params.slug;
      const product = await productService.getProduct(slug);
      return res.json(product);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async updateProduct(req, res, next) {
    try {
      const body = req.body;
      const result = await productService.updateProduct(body);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
  async removeProduct(req, res, next) {
    try {
      const id = req.params.id;
      const result = await productService.removeProduct(id);
      return res.json(result);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }
}
module.exports = new ProductControllers();
