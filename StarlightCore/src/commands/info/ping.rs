use vesper::prelude::*;

#[command]
#[description = "[EN] Ping the bot to check if it's online. [TH] แสดงปิงของบอทเพื่อเช็คว่าบอทออนไลน์อยู่หรือไม่"]
async fn ping(ctx: &SlashContext<()>) -> DefaultCommandResult {
    use vesper::twilight_exports::{
        InteractionResponse, InteractionResponseData, InteractionResponseType,
    };

    ctx.interaction_client
        .create_response(
            ctx.interaction.id,
            &ctx.interaction.token,
            &InteractionResponse {
                kind: InteractionResponseType::ChannelMessageWithSource,
                data: Some(InteractionResponseData {
                    content: Some("🏓 Pong!".to_string()),
                    ..InteractionResponseData::default()
                }),
            },
        )
        .await?;

    Ok(())
}
