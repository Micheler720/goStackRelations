import { container, inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomerRepository')
    private customersRepository: ICustomersRepository
    ) {

    }

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const verifyEmail = await this.customersRepository.findByEmail(email);
    if(verifyEmail){
      throw new AppError('Email reald exist, not possible register');
    }
    const customer = await this.customersRepository.create({
      email,
      name
    })
    return customer;
  }
}

export default CreateCustomerService;
