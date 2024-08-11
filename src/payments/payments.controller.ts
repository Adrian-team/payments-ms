import {
  Body,
  Controller,
  Get,
  Post,
  RawBodyRequest,
  Req,
  Res,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDTO } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession(@Body() paymentSessionDTO: PaymentSessionDTO) {
    return this.paymentsService.createPaymentSession(paymentSessionDTO);
  }
  @Get('success')
  success() {
    return {
      ok: true,
      message: 'payment successful',
    };
  }
  @Get('cancel')
  cancel() {
    return {
      ok: false,
      message: 'payment cancel',
    };
  }
  @Post('webhook')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    return this.paymentsService.stripeWebHook(req, res);

    // return 'stripeWebhook';
  }
}
