import { Request, Response } from 'express';

import CreateCustomerService from '@modules/customers/services/CreateCustomerService';

import { container } from 'tsyringe';

export default class CustomersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, email } = request.body;
    const createCutomer = container.resolve(CreateCustomerService);
    const customer = await createCutomer.execute({
      email,
      name,
    });
    return response.json(customer).status(200);
  }
}
