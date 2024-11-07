const ProductModel = require('../models/product-model');
const ApiError = require('../exception/api-error');

class ProductService {
  async createProduct(title, description, price, images, category, slug) {
    const items = await ProductModel.findOne({ title });
    if (items) {
      throw ApiError.BadRequest(`Такий товар вже існує`);
    }
    await ProductModel.create({ title, description, price, images, category, slug });
    let status = 200;
    return status;
  }
  async getAllProducts(category, priceRange) {
    let products;
    let query = {};

    if (category !== 'all-products') {
      query.category = category;
    }

    if (priceRange) {
      if (priceRange.min && priceRange.max) {
        query.price = { $gte: priceRange.min, $lte: priceRange.max };
      } else if (priceRange.min) {
        query.price = { $gte: priceRange.min };
      } else if (priceRange.max) {
        query.price = { $lte: priceRange.max };
      }
    }
    products = await ProductModel.find(query);

    return products;
  }

  async getAllProductsSearch(name) {
    let products = await ProductModel.find({ title: { $regex: name, $options: 'i' } });
    return products;
  }

  async getProduct(slug) {
    const product = await ProductModel.findOne({ slug });
    return product;
  }
  async updateProduct(body) {
    let { title, description, price, images, category, slug, id } = body;
    const updateDoc = {
      $set: {
        title: title,
        description: description,
        price: price,
        images: images,
        category: category,
        slug: slug,
      },
    };
    const options = { returnDocument: 'after' };
    const product = await ProductModel.findOneAndUpdate({ _id: id }, updateDoc, options);
    if (product) {
      return { message: 'Продукт успішно оновлено' };
    } else if (!product) {
      throw ApiError.BadRequest(`Не вдалося оновити продукт`);
    } else {
      throw ApiError.BadRequest(`Якась помилка`);
    }
  }
  async removeProduct(id) {
    const response = await ProductModel.findOneAndDelete({ _id: id });
    if (response) {
      return { message: 'Продукт успішно видалено' };
    } else if (!response) {
      throw ApiError.BadRequest(`Не вдалося видалити продукт`);
    } else {
      throw ApiError.BadRequest(`Якась помилка`);
    }
  }
}

module.exports = new ProductService();
