import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });
    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const findProducts = await this.ormRepository.findByIds(products);
    return findProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const idsProduct = products.map(product => ({ id: product.id }));
    const productsUpdate = await this.findAllById(idsProduct);

    const productsUpdateQuantity = productsUpdate.map(productUpdate => {
      const product = products.filter(
        findProduct => findProduct.id === productUpdate.id,
      );

      return {
        ...productUpdate,
        quantity: productUpdate.quantity - product[0].quantity,
      };
    });

    await this.ormRepository.save(productsUpdateQuantity);

    return productsUpdateQuantity;
  }
}

export default ProductsRepository;
