import winston, {format} from 'winston'



const {combine, colorize, label, timestamp, printf} = format

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  });

export const logger = winston.createLogger({
transports: [
    new winston.transports.Console()
],
format: combine(
    colorize(),
    label({ label: 'AMBOLT'}),
    timestamp(),
    myFormat
)
})

