
export default {
  async fetch(request, env) {
    try {
      if (!env.ASSETS) {
        return new Response("静态文件绑定 ASSETS 尚未配置", {
          status: 500
        });
      }

      return await env.ASSETS.fetch(request);
    } catch (error) {
      return new Response("Worker Error: " + error.message, {
        status: 500
      });
    }
  }
};
