<template>
  <div class="not-found-page">
    <h1>404 NotFound</h1>
    <p>抱歉，您访问的页面不存在。</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFoundPage'
}
</script>

<style scoped>
.not-found-page {
  text-align: center;
  margin-top: 50px;
}

.not-found-page h1 {
  font-size: 2em;
  color: red;
}

.not-found-page p {
  font-size: 1.2em;
}
</style>