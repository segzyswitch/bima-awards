<script lang="ts" setup>
// Define props
const props = defineProps<{
  nominee: any,
	payment_methods: any
}>();

const votePricing = [
	{ votes: 25, price: 10 },
	{ votes: 75, price: 30 },
	{ votes: 125, price: 50 },
	{ votes: 225, price: 90 },
	{ votes: 500, price: 200 },
];

const activePage:any = ref(null);
const manualAmount = ref<number | null>(null);
const selectedPricing = ref<{ votes: number; price: number } | null>(null);
const donateTerms = ref(false);

const manualVote = computed((): { votes: number; price: number } => {
  return {
    price: (manualAmount.value ?? 0),
		votes: (manualAmount.value ?? 0) * 2.5
  }
});
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

// Payment methods
const selectedMethod:any = ref(null);
function selectMethod(method:any) {
	selectedMethod.value = method;
	// copy to clipboard
	const text = method.tag;
  navigator.clipboard.writeText(text)
  .then(() => {
    alert('Copied!');
  })
  .catch(() => {
    alert('Failed to copy.');
  });
}
const loadData = ref(false);
const formdata:any = ref({
	email: '',
});
const formerr:any = ref({
	email: '',
	payment_method: '',
});

const file:any = ref<File | null>(null);
const preview = ref<string | null>(null);
const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file.value = target.files[0];
    preview.value = URL.createObjectURL(file.value);
		console.log(file.value);
  }
};

// Send votes
import { useVotes } from '~/composables/useVotes';
const { submitVote, loading, error } = useVotes();
function castVote() {
	// validate form
	loadData.value = true;
	// return false;
	const voteData = {
		userEmail: formdata.email,
		contestantId: props.nominee.id,
		votes: selectedPricing.value?.votes || 0,
		amountPaid: selectedPricing.value?.price || 0,
		paymentMethod: selectedMethod?.name || '',
		category: props.nominee.category || '',
		proofFile: file.value || null,
	};
	submitVote(voteData).then((resp) => {
		loadData.value = false;
		console.log(resp);
		// close modal
	}).catch((err) => {
		loadData.value = false;
		console.log(err);
	});
}

</script>

<template>
	<teleport to="body">
		<div class="modal fade" :id="`Modal_${nominee.id}`" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-hidden="true">
			<div class="modal-dialog">
				<div class="modal-content text-light text-center">
					<div class="modal-header border-0" v-if="!activePage">
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
										<button type="button" @click="makeVote(rates)" class="btn border-gold bg-dark text-gold w-100" :class="{'bg-gold text-dark': selectedPricing?.price==rates.price}">{{ rates.votes }} votes <br /> ${{rates.price}}</button>
									</div>
									<div class="col-6">
										<button type="button" @click="makeVote('manual')" class="btn border-gold bg-dark text-gold w-100" :class="{'bg-gold text-dark': !payAuto}">Custom amount <br /> above $200</button>
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
											${{ `${manualAmount} = ${manualAmount * 2.5} votes` }}
										</small>
									</div>
								</div>
							</div>
							<label class="d-block mb-4" style="font-size:.9rem;">
								<input type="checkbox" v-model="donateTerms" style="scale: 1.2;" required />
								<span class="ms-2">I agree that all donations are final and non-refundable.</span>
							</label>
							<p class="text-center">
								<button :disabled="!donateTerms||!selectedPricing" @click="activePage='payment'" style="scale:1.2;" type="submit" class="btn btn-warning px-4">Continue</button>
							</p>
						</form>
						<form @submit.prevent="castVote" class="position-relative" v-if="activePage=='payment'">
							<p class="text-start">
								<button type="button" @click="activePage=null" class="btn p-0 border-0 bg-transparent text-light" aria-label="Close">
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
								</button>
							</p>
							<h1 class="text-gold">Donate ${{ selectedPricing?.price }} for {{ selectedPricing?.votes }} points to vote:</h1>
							<p class="text-light text-uppercase h5">{{ nominee.name }}</p>
							<p class="text-gold mb-4">In Category: <span class="text-uppercase">{{ nominee.category }}</span></p>
							<div class="w-100 rounded-3 border border-gold p-3 mb-4 text-start">
								<h5>Select payment method</h5>
								<div class="row pt-3">
									<div class="col-12 pb-3" v-for="(method, idx) in payment_methods" :key="idx">
										<button type="button" @click="selectMethod(method)" class="btn border-gold bg-dark text-gold text-start w-100 d-flex"
											:class="{'bg-gold text-dark': selectedMethod?.name==method?.name}">
											<img :src="method.icon" class="my-auto" :alt="method.name" height="35" />
											<div class="ps-2">
												<p class="m-0">{{ method.name }}</p>
												<small>{{ method.tag }}</small>
											</div>
											<span class="bi bi-copy ms-auto text-muted my-auto"></span>
										</button>
									</div>
									<div class="col-12 mb-4 mt-2">
										<label class="mb-1">Email address:</label>
										<input type="email" placeholder="Email address" class="form-control" required />
									</div>
									<div class="col-12 mb-2">
										<label class="mb-1">Proof of payment (optional):</label>
										<input type="file" accept="image/*" @change="handleFileChange" class="d-none" />
										<button type="button" class="form-control text-start" onclick="document.querySelector('input[type=file]')?.click()">
											<i class="bi bi-cloud-arrow-up pe-1"></i> {{ file ? file.name : 'Upload file' }}
										</button>
										<small class="d-block pt-2 text-start" style="opacity:.6;">Upload screenshot or photo of your payment.</small>
									</div>
								</div>
							</div>
							<p class="text-center">
								<button :disabled="!selectedPricing||loadData" style="scale:1.2;" type="submit" class="btn btn-warning px-4">
									<i class="spinner-border spinner-border-sm" v-if="loadData"></i> Submit payment
								</button>
							</p>
						</form>
					</div>
				</div>
			</div>
		</div>
	</teleport>
</template>