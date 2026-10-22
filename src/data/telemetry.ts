/**
 * The hero's telemetry panel.
 *
 * These are the same figures the hero's systems constellation used to draw —
 * the gateway's throughput, the core kernel's scheduler and p99, the cluster's
 * health. Nothing here is new: the data moved out of the component so the
 * panel can present it as a readout instead of a graph.
 *
 * The panel is the hero's only instrument, and it is decorative chrome: it
 * states the shape of the system this engineer works on, so the numbers are
 * the ones the site has always claimed for that system.
 */

export interface TelemetryRow {
  label: string
  value: string
  /** Health rows carry a status light instead of a plain value. */
  status?: 'nominal'
}

export const telemetryRows: TelemetryRow[] = [
  { label: 'Scheduler', value: 'HA-Distributed' },
  { label: 'Consensus', value: 'Raft/v2' },
  { label: 'Health', value: '100% Nominal', status: 'nominal' },
  { label: 'Throughput', value: '12.4k req/s' },
  { label: 'P99 Latency', value: '0.8ms' },
]

/** The packet-stream trace under the readout, and the average it reports. */
export const telemetryStream = {
  label: 'Packet Stream Dynamics',
  average: '0.82ms avg',
  /** Normalised samples (0–1), oldest first. */
  samples: [
    0.68, 0.96, 1, 1, 0.89, 0.87, 0.69, 0.28, 0.34, 0.37, 0.11, 0.44, 0.43,
    0.59, 0.47, 0.59, 0.34, 0.13, 0.11, 0.08, 0, 0.12, 0.19, 0.51, 0.77, 0.95,
    0.92, 0.84, 0.78, 0.67, 0.56, 0.51, 0.28, 0.66, 0.65, 0.7, 0.9, 0.87, 0.68,
    0.52, 0.29, 0.22, 0.17, 0, 0.17, 0.17, 0.21, 0.45, 0.53, 0.72, 0.53, 0.45,
    0.14, 0.14, 0.05, 0.21,
  ],
}

/** The specialisation the panel is measuring, and where it runs. */
export const telemetryTarget = {
  label: 'Primary Specialization',
  value: 'Distributed APIs & Cloud Microservices',
  target: 'Production',
  state: 'Live Prod',
}
