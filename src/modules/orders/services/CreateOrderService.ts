import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';
import ICreateOrderDTO from '../dtos/ICreateOrderDTO';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomerRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError(
        'Not is possible register order, not already customer',
      );
    }
    const idsProduct = products.map(product => ({ id: product.id }));

    const verifyProducts = await this.productsRepository.findAllById(
      idsProduct,
    );

    if (verifyProducts.length !== idsProduct.length) {
      throw new AppError(
        'Not is possible register of orders, not already products all.',
      );
    }
    verifyProducts.forEach(product => {
      const productUpdate = products.filter(
        findProduct => findProduct.id === product.id,
      );
      if (product.quantity < productUpdate[0].quantity) {
        throw new AppError('products with insufficient quantities ');
      }
    });

    const productsCreate = verifyProducts.map(product => {
      const productQuant = products.filter(
        findProduct => findProduct.id === product.id,
      );
      return {
        product_id: product.id,
        price: product.price,
        quantity: productQuant[0].quantity,
      };
    });

    const createOrder: ICreateOrderDTO = {
      customer,
      products: productsCreate,
    };
    const order = await this.ordersRepository.create(createOrder);
    await this.productsRepository.updateQuantity(products);
    return order;
  }
}

export default CreateOrderService;
