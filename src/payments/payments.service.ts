import { Inject, Injectable, RawBodyRequest } from '@nestjs/common';
import { NATS_SERVICE, envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDTO } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  public async createPaymentSession(paymentSessionDTO: PaymentSessionDTO) {
    const { currency, items, orderId } = paymentSessionDTO;

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          orderId,
        },
      },
      line_items: items.map((item) => ({
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: envs.urlSuccess,
      cancel_url: envs.urlCancel,
    });
    return {
      cancelUrl: session.cancel_url,
      successUrl: session.success_url,
      url: session.url,
    };
  }

  public async stripeWebHook(req: RawBodyRequest<Request>, res: Response) {
    const sig = req.headers['stripe-signature'];
    const secretEndpoint = envs.secretEndpoint;
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        secretEndpoint,
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'charge.succeeded':
        // Llamar a migrasevicio
        const chargeSucceeded = event.data.object;
        const payload = {
          stripePaymentId: chargeSucceeded.id,
          orderId: chargeSucceeded.metadata.orderId,
          receipURL: chargeSucceeded.receipt_url,
        };
        this.client.emit('payment.succeeded', payload);
        break;

      default:
        break;
    }

    res.send();
  }
}
