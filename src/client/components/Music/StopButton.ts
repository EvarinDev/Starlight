import { ComponentCommand, type ComponentContext } from 'seyfert';

import { MessageFlags } from 'seyfert/lib/types';

export default class StopButton extends ComponentCommand {
  componentType = 'Button' as const;

  filter(ctx: ComponentContext<typeof this.componentType>) {
    return ctx.customId === 'music.stop';
  }

  async run(ctx: ComponentContext<typeof this.componentType>) {
    return ctx.editOrReply({
      content: 'Hello World 👋',
      flags: MessageFlags.Ephemeral
    });
  }
}