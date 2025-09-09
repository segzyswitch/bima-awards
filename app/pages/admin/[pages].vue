<script setup lang="ts">
import { collection, getDocs, Timestamp, query, orderBy,  } from "firebase/firestore";
import { useAdminAuth } from '~/composables/useAdminAuth';
import { openModal } from "~/utils/modal";
// SweetAlert
const { $swal } = useNuxtApp();
const { $db } = useNuxtApp();
const { user, logout } = useAdminAuth();
const router = useRouter();
const route = useRoute();

// redirect to login if not logged in
// if (!user.value) router.push('/admin');

// page route
const slug = route.params.pages;

// Edit data
const editNominee:any = ref(null);
function selectNominee(nominee:any) {
  // nomineeForm.value?.makeEdit();
	if (nominee) {
		editNominee.value = nominee;
	}else editNominee.value = null;
	
	openModal('newNominee');
}

// delete data
const { deleteContestant } = useAdmin();
const removeNominee:any = ref(null);
async function resolveNominee(nominee:any) {
	if (nominee) {
		removeNominee.value = nominee;
		try {
			const result = await deleteContestant(nominee.id);
			if (!result.success) {
				$swal.fire({
					title: 'Sorry!',
					icon: 'warning',
					text: result?.error??'Unable to delete, try again',
				});
				return false;
			}
			$swal.fire({
				title: 'Success!',
				icon: 'success',
				text: 'Nominee removed successfully!',
			});
			console.log(result);
			loadAll();
		} catch (err) {
			console.log(err)
		}
	}else editNominee.value = null;
	
	// openModal('newNominee');
}

const Contestants = ref<any[]>([]);
const paymentMethods = ref<any[]>([]);
const Votes = ref<any[]>([]);

// get single nominee
function getContestantById(id: string): any {
  return Contestants.value.find(c => c.id === id)
}

function formatFirestoreTimestamp(timestamp: Timestamp): string {
  // Convert Firestore Timestamp to JavaScript Date
  const date = timestamp.toDate();
  // Get parts of the date
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear().toString().slice(-2);
  // Format hours and minutes for 12-hour format
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
	// Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
	// Return formatted date string
  return `${day}/${month}/${year} ${hours}:${minutes}${ampm}`;
}

const loadData = ref(true);

async function loadAll() {
	// fetch contestants
	const constestSnapshot = await getDocs(
		query(collection($db, "contestants"), orderBy("createdAt", "desc"))
	);
	Contestants.value = constestSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	// fetch payment methods
	const paymentSnapshot = await getDocs(collection($db, "payment_methods"));
	paymentMethods.value = paymentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	// fetch votes
	const votesSnapshot = await getDocs(
		query(collection($db, "votes"), orderBy("createdAt", "desc"))
	);
	Votes.value = votesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

	loadData.value = false;
}
// Fetch data on mount
onMounted( () => {
	loadAll();
});
</script>

<template>
	<div class="container-fluid pb-5">
		<div class="row pb-4">
			<div class="col-sm-3 ps-0 d-none d-sm-block">
				<div class="bg-dark vh-100 text-light position-fixed start-0 top-0 col-3 p-0">
					<h3 class="text-gold px-3 pt-3 mb-0">Bima Admin</h3>
					<hr class="border-gold">
					<div class="w-100 sidenav">
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
								<router-link to="/admin/settings" class="nav-link">Settings</router-link>
							</li>
							<li class="nav-item mb-2">
								<a href="#" @click.prevent="logout" class="nav-link">Logout</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="col-sm-9">
				<div class="navbar navbar-expand-lg navbar-dark row mb-5">
					<div class="container-fluid">
						<!-- <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
							<span class="navbar-toggler-icon"></span>
						</button> -->
						<div class="collapse navbar-collapse" id="navbarSupportedContent">
							<ul class="navbar-nav ms-auto">
								<li class="nav-item dropdown">
									<a class="nav-link p-0" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
										<i class="bi bi-person-circle h3"></i>
									</a>
									<ul class="dropdown-menu pt-0" aria-labelledby="navbarDropdown" style="left:auto;right:0;">
										<div class="w-100 p-2">
											<div class="w-100 p-2 px-3 rounded-3 text-light"
												style="background-color:rgba(255,255,255,.2);">
												<i class="bi bi-person"></i> ADMIN
											</div>
										</div>
										<li><hr class="dropdown-divider text-light"></li>
										<li><a class="dropdown-item" href="#">Settings</a></li>
										<li><a class="dropdown-item" href="#">Logout</a></li>
									</ul>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<!-- Dashboard -->
				<section class="w-100" v-if="slug=='dashboard'">
					<h1 class="text-light mb-4">Dashboard Overview</h1>
					<p class="text-center py-5" v-if="loadData"><i class="spinner-border text-light"></i></p>
					<div class="row g-4" v-else>
						<div class="col-sm-6">
							<router-link to="/admin/nominees" class="btn w-100 h-100 btn-success p-3 text-center">
								<p class="lead">Contestants</p>
								<h1 class="display-2">{{ Contestants.length }}</h1>
							</router-link>
						</div>
						<div class="col-sm-6">
							<router-link to="/admin/payments" class="btn w-100 h-100 btn-primary p-3 text-center">
								<p class="lead">Payment methods</p>
								<h1 class="display-2">{{ paymentMethods.length }}</h1>
							</router-link>
						</div>
						<div class="col-sm-6">
							<router-link to="/admin/payments" class="btn w-100 h-100 btn-warning p-3 text-center">
								<p class="lead">Total votes</p>
								<h1 class="display-2">{{ Votes.length }}</h1>
							</router-link>
						</div>
						<div class="col-sm-6">
							<router-link to="/admin/settings" class="btn w-100 h-100 btn-warning p-3 text-center">
								<h1 class="display-2"><i class="bi bi-gear"></i></h1>
								<p class="lead m-0">Settings</p>
							</router-link>
						</div>
					</div>
				</section>

				<!-- Nominee -->
				<section class="w-100" v-if="slug=='nominees'">
					<div class="d-flex mb-4">
						<h1 class="text-light my-auto">All Nominees</h1>
						<button @click="selectNominee(null)" class="btn ms-auto btn-secondary my-auto">Add new</button>
					</div>
					<add-nominee :nominee="editNominee" :reload-data="loadAll" />
					<p class="text-center py-5" v-if="loadData"><i class="spinner-border text-light"></i></p>
					<table class="table text-light" v-else>
						<thead>
							<tr>
								<th scope="col">#</th>
								<th scope="col">Name</th>
								<th scope="col">Category</th>
								<th scope="col">Votes</th>
								<th scope="col">Options</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(nom, idx) in Contestants" :key="idx">
								<th scope="row">{{ idx + 1 }}</th>
								<td class="d-flex">
									<div class="contest-img overflow-hidden border-0 p-1"
										style="width:50px;height:50px;background-color: rgba(59, 29, 9, .5);background:linear-gradient(185deg, rgba(59, 29, 9, .5), rgb(218, 165, 32));">
										<div class="w-100 h-100 rounded-circle overflow-hidden"><img :src="nom.image" class="w-100" :alt="nom.name" /></div>
									</div>
									<span class="ps-2 my-auto">{{ nom.name }}</span>
								</td>
								<td>{{ nom.category }}</td>
								<td>{{ nom.votes }}</td>
								<td>
									<a href="javascript:void(0)" class="btn text-primary p-1" @click="selectNominee(nom)">edit</a>
									<a href="javascript:void(0)" class="btn text-danger p-1" @click="resolveNominee(nom)">delete</a>
								</td>
							</tr>
						</tbody>
					</table>
				</section>

				<!-- Votes -->
				<section class="w-100" v-if="slug=='votes'">
					<h1 class="text-light mb-4">All Votes</h1>
					<p class="text-center py-5" v-if="loadData"><i class="spinner-border text-light"></i></p>
					<table class="table text-light table-hover" v-else>
						<thead>
							<tr>
								<th scope="col">#</th>
								<th scope="col">Voter's email</th>
								<th scope="col">Nominee</th>
								<th scope="col">Votes</th>
								<th scope="col">Amount</th>
								<th scope="col">Payment method/proof</th>
								<th scope="col">Date</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(vote, idx) in Votes" :key="idx" class="text-light">
								<th scope="row">{{ idx + 1 }}</th>
								<td>{{ vote.userEmail }}</td>
								<td><img :src="vote.image" width="25" /> <span class="ps-1">{{ getContestantById(vote.id)?.name??'...' }}</span></td>
								<td>{{ vote.votes }}</td>
								<td>${{ vote.amountPaid }}</td>
								<td>{{ vote.paymentMethod }} <a :href="vote.proofFileName" @click.prevent v-if="vote.proofFileName">Show reciept</a></td>
								<td>{{ formatFirestoreTimestamp(vote.createdAt) }}</td>
							</tr>
						</tbody>
					</table>
				</section>

				<!-- Payment Methods -->
				<section class="w-100" v-if="slug=='payments'">
					<div class="d-flex">
						<h1 class="text-light mb-4">Payment methods</h1>
						<button class="btn ms-auto btn-secondary my-auto">Add new</button>
					</div>
					<p class="text-center py-5" v-if="loadData"><i class="spinner-border text-light"></i></p>
					<table class="table text-light table-hover" v-else>
						<thead>
							<tr>
								<th>Payment method</th>
								<th colspan="2">Tag</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(payment, idx) in paymentMethods" :key="idx" class="text-light">
								<td>
									<img :src="payment.icon" :alt="payment.name" width="45">
									<span class="ps-3">{{ payment.name }}</span>
								</td>
								<td>{{ payment.tag }}</td>
								<td>
									<a href="#" class="btn p-1 text-primary">edit</a>
									<a href="#" class="btn p-1 text-danger">delete</a>
								</td>
							</tr>
						</tbody>
					</table>
				</section>
			</div>
		</div>
	</div>
</template>

<style scoped>
.sidenav .nav-link {
	color: #cecece;
}
.sidenav .router-link-exact-active {
	color: goldenrod!important;
	border-left: 3px solid goldenrod;
}

.dropdown-menu {
	background-color: #404040;
}
.dropdown-menu .dropdown-item { color: #cecece; }
.dropdown-menu .dropdown-item:hover { color: #6a6a6a; }
</style>