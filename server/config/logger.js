import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "warn";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.json(),
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
  //   new winston.transports.File({
  //     filename: path.join(__dirname, '../logs/error.log'),
  //     level: 'error',
  //     format: fileFormat,
  //   }),
  //   new winston.transports.File({
  //     filename: path.join(__dirname, '../logs/combined.log'),
  //     format: fileFormat,
  //   }),
];

const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false,
});

const stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

const logRequest = (req, res, next) => {
  logger.http(`${req.method} ${req.originalUrl}`);
  next();
};

export { logger, stream, logRequest };
