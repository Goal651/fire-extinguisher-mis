import amqplib, { Channel, ChannelModel } from "amqplib";

// amqplib >= 0.10 returns ChannelModel from connect(), not Connection
let model: ChannelModel | null = null;
let channel: Channel | null = null;

export const QUEUES = {
  EXPIRY_WARNING:    "extinguisher.expiry_warning",
  EXPIRED:           "extinguisher.expired",
  POLICE_ESCALATION: "extinguisher.police_escalation",
  ALREADY_EXPIRED:   "extinguisher.already_expired",
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

export const connectRabbitMQ = async (): Promise<Channel> => {
  if (channel) return channel;

  const url = process.env.RABBITMQ_URL || "amqp://localhost:5672";
  let retries = 5;

  while (retries > 0) {
    try {
      model = await amqplib.connect(url);
      channel = await model.createChannel();

      // Assert all queues durable so messages survive RabbitMQ restart
      for (const q of Object.values(QUEUES)) {
        await channel.assertQueue(q, { durable: true });
      }

      console.log("[RabbitMQ] Connected and queues asserted");

      model.on("error", (err: Error) => {
        console.error("[RabbitMQ] Connection error:", err.message);
        channel = null;
        model = null;
      });

      model.on("close", () => {
        console.warn("[RabbitMQ] Connection closed — will reconnect on next use");
        channel = null;
        model = null;
      });

      return channel;
    } catch (err) {
      retries--;
      console.warn(`[RabbitMQ] Could not connect, retrying... (${retries} left)`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  throw new Error("[RabbitMQ] Failed to connect after retries");
};

export const publishMessage = async (queue: QueueName, payload: object): Promise<void> => {
  const ch = await connectRabbitMQ();
  ch.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), { persistent: true });
};

export const consumeMessages = async (
  queue: QueueName,
  handler: (payload: any) => Promise<void>,
): Promise<void> => {
  const ch = await connectRabbitMQ();
  ch.consume(queue, async (msg) => {
    if (!msg) return;
    try {
      const payload = JSON.parse(msg.content.toString());
      await handler(payload);
      ch.ack(msg);
    } catch (err) {
      console.error(`[RabbitMQ] Handler error on queue ${queue}:`, err);
      ch.nack(msg, false, false); // discard — prevents infinite retry loop
    }
  });
};
