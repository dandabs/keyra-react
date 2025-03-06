import prodEnv from './environment';
import devEnv from './environment.dev';

const env = process.env.NODE_ENV;

export const config = env === 'development' ? devEnv : prodEnv;
