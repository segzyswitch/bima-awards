<script lang="ts" setup>
// Define props
const props = defineProps<{
  logout: any,
}>();
</script>

<template>
	<ul class="nav flex-column">
		<li class="nav-item mb-2">
			<router-link to="/admin/dashboard" class="nav-link">Overview</router-link>
		</li>
		<li class="nav-item mb-2">
			<router-link to="/admin/nominees" class="nav-link">Contestants</router-link>
		</li>
		<li class="nav-item mb-2">
			<router-link to="/admin/votes" class="nav-link">Votes</router-link>
		</li>
		<li class="nav-item mb-2">
			<router-link to="/admin/payments" class="nav-link">Payment Methods</router-link>
		</li>
		<li class="nav-item mb-2">
			<a to="#" class="nav-link">Settings</a>
		</li>
		<li class="nav-item mb-2">
			<a href="#" @click.prevent="logout" class="nav-link">Logout</a>
		</li>
	</ul>
</template>

<style scoped>
.nav-link {
	color: #cecece;
}
.router-link-exact-active {
	color: goldenrod!important;
	border-left: 3px solid goldenrod;
}
</style>