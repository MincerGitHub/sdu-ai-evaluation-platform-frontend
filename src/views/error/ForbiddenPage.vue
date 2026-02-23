<template>
  <div class="forbidden-page">
    <h1>403 Forbidden</h1>
    <p>抱歉，您没有权限访问此页面。</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script>
export default {
  name: 'ForbiddenPage'
}
</script>

<style scoped>
.forbidden-page {
  text-align: center;
  margin-top: 50px;
}

.forbidden-page h1 {
  font-size: 2em;
  color: red;
}

.forbidden-page p {
  font-size: 1.2em;
}
</style>