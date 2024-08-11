import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  STRIPE_SECRET: string;
  SECRET_ENDPOINT: string;
  URL_SUCCESS: string;
  URL_CANCEL: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    STRIPE_SECRET: joi.string().required(),
    SECRET_ENDPOINT: joi.string().required(),
    URL_SUCCESS: joi.string().required(),
    URL_CANCEL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  stripeSecret: envVars.STRIPE_SECRET,
  secretEndpoint: envVars.SECRET_ENDPOINT,
  urlSuccess: envVars.URL_SUCCESS,
  urlCancel: envVars.URL_CANCEL,
};
