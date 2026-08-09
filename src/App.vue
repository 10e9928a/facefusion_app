<script setup lang="ts">
import { onLaunch } from "@dcloudio/uni-app";
import { saveInviterIdFromQuery } from "@/config/hub";
import { ensureLogin } from "@/stores/auth";

onLaunch((options) => {
  saveInviterIdFromQuery(options?.query as Record<string, string | undefined>);
  ensureLogin().catch(() => {});
});
</script>
<style lang="scss">
@import "uview-plus/index.scss";
</style>
