import {
  emitPostHogLog,
  flushPostHogLogs,
  SeverityNumber,
} from '../../instrumentation';

export function logPostHogInfo(body, attributes) {
  emitPostHogLog({ body, severityNumber: SeverityNumber.INFO, attributes });
}

export function logPostHogError(body, attributes) {
  emitPostHogLog({ body, severityNumber: SeverityNumber.ERROR, attributes });
}

export { flushPostHogLogs };
