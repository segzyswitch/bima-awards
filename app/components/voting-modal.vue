<script lang="ts" setup>
// Define props
const props = defineProps<{
  nominee: any,
}>();

const votePricing = [
	{ votes: 20, price: 15 },
	{ votes: 50, price: 30 },
	{ votes: 100, price: 50 },
	{ votes: 200, price: 90 },
	{ votes: 500, price: 200 },
];

const activePage:any = ref(null);
const manualAmount = ref<number | null>(null);
const selectedPricing = ref<{ votes: number; price: number } | null>(null);
const donateTerms = ref(false);

const manualVote = computed((): { votes: number; price: number } => {
  return {
    price: (manualAmount.value ?? 0),
		votes: (manualAmount.value ?? 0) * 20
  }
})
const payAuto = ref(true);
function makeVote(query: { votes: number; price: number } | 'manual') {
	if (query == 'manual') {
		payAuto.value = false;
		// handle manual amount
		selectedPricing.value = manualVote.value;
		return false;
	}
	payAuto.value = true;
	selectedPricing.value = query;
}

</script>

<template>
	<teleport to="body">
		<!--  data-bs-backdrop="static" data-bs-keyboard="false" -->
		<div class="modal fade" :id="`Modal_${nominee.id}`" tabindex="-1" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content text-light text-center">
					<div class="modal-header border-0">
						<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div class="modal-body">
						<form @submit.prevent v-if="!activePage">
							<h4 class="text-gold">Donate for this Nominee</h4>
							<div class="col-7 col-sm-4 mx-auto py-2 mb-2 rounded-circle">
								<div class="contest-img overflow-hidden"><img :src="nominee.image" class="w-100" :alt="nominee.name" /></div>
							</div>
							<p class="text-light text-uppercase h4">{{ nominee.name }}</p>
							<p class="text-gold mb-4">In Category: <span class="text-uppercase">{{ nominee.category }}</span></p>
							<div class="w-100 rounded-3 border border-gold p-3 mb-4">
								<h5>Select Donation Amount</h5>
								<div class="row g-4 pt-3">
									<div class="col-6" v-for="rates in votePricing" :key="rates.votes">
										<button @click="makeVote(rates)" class="btn border-gold bg-dark text-gold w-100" :class="{'bg-gold text-dark': selectedPricing?.price==rates.price}">{{ rates.votes }} votes <br /> ${{rates.price}}</button>
									</div>
									<div class="col-6">
										<button @click="makeVote('manual')" class="btn border-gold bg-dark text-gold w-100" :class="{'bg-gold text-dark': !payAuto}">Custom amount <br /> above $200</button>
									</div>
									<div class="col-12 position-relative" v-if="!payAuto">
										<span class="position-absolute d-inline-block" style="top:5px;left:17.5px;">
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
										</span>
										<input v-model="manualAmount"
											type="number" min="200"
											placeholder="Enter amount"
											class="form-control"
											style="padding-left:30px;"
											required
										/>
										<small class="d-block pt-2 text-start" style="opacity:.6;" v-if="manualAmount && manualAmount>0">
											{{ `${manualAmount} = ${manualAmount * 20} votes` }}
										</small>
									</div>
								</div>
							</div>
							<label class="d-block mb-4" style="font-size:.9rem;">
								<input type="checkbox" v-model="donateTerms" style="scale: 1.2;" required />
								<span class="ms-2">I agree that all donations are final and non-refundable.</span>
							</label>
							<p class="text-center"><button :disabled="!donateTerms" type="submit" class="btn btn-warning px-4">Continue</button></p>
						</form>
					</div>
				</div>
			</div>
		</div>
	</teleport>
</template>