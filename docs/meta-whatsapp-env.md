# Meta/WhatsApp tokens

Use only environment variables or the hosting secrets manager. Do not commit real tokens.

## Required for WhatsApp Cloud API outbound

- `WHATSAPP_MODE=cloud_api`
- `WHATSAPP_ACCESS_TOKEN` or `META_SYSTEM_USER_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID` or `META_PHONE_NUMBER_ID`
- `WHATSAPP_VERIFY_TOKEN` or `META_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET` or `META_APP_SECRET`
- `META_ENABLE_WHATSAPP_OUTBOUND=true`

The access token from Meta Access Token Debugger normally maps to `META_SYSTEM_USER_TOKEN` or `WHATSAPP_ACCESS_TOKEN`.
The phone number ID usually does not come from the token debugger; get it from WhatsApp Manager / Cloud API phone number settings.

## Webhooks

Configure these callback URLs in Meta for Developers:

- WhatsApp: `https://www.mdh3d.com.br/api/webhooks/whatsapp`
- Facebook Page messaging: `https://www.mdh3d.com.br/api/webhooks/meta-messaging`
- Instagram: `https://www.mdh3d.com.br/api/webhooks/instagram`

Use the same value in Meta webhook verification and `META_VERIFY_TOKEN` / `WHATSAPP_VERIFY_TOKEN`.

## Safe local check

After setting secrets in the environment, verify readiness through the admin Meta integration page or `GET /api/admin/meta`.
The app should report WhatsApp as configured without exposing token values.
