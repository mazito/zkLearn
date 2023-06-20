<script>
  import { onMount } from 'svelte';
	import { page } from '$app/stores';
  
  // local imports ...
	import { Spinner, Icon } from 'sveltestrap';
  import { Container } from 'sveltestrap';
  import { Styles } from 'sveltestrap';
  import Welcome from '@components/Welcome.svelte';

  onMount(async () => {
    // nothing here yet ...
  });
</script>

<!-- MUST include here Bootstrap styling -->
<Styles />

<style global>
  @import '../styles/globals.css';
</style>

<svelte:head>
  <title>zkApp SvelteKit UI</title>
</svelte:head>

<div style="position:fixed;top:0;left:0;bottom:0;right:0;">
  <!-- Leave space for header here ... -->
  <div style="margin-top:0rem;border:0px dotted red;overflow:auto;">
    <Container class="mt-5 p-5">
      <slot></slot>
    </Container>
  </div>
</div>
