<script>
  import { Button, Dropdown, Input } from "figma-ui3-kit-svelte";
  import {
    PluginLayout,
    FieldGroup,
    EmptyState,
    Footer,
    sendToPlugin,
    createMessageHandler,
  } from "figma-plugin-utils";

  let propertiesData = {};
  let propertyOptions = [];
  let valueOptions = [];
  let selectedProperty = null;
  let selectedValue = null;
  let newValue = "";
  let errorMessage = "";
  let isLoading = true;

  $: if (selectedProperty && propertiesData[selectedProperty.value]) {
    valueOptions = propertiesData[selectedProperty.value].map((v) => ({
      label: v,
      value: v,
    }));
    if (valueOptions.length > 0 && !selectedValue) {
      selectedValue = valueOptions[0];
    }
  }

  function handleRename() {
    if (!selectedProperty || !selectedValue || !newValue.trim()) return;
    sendToPlugin("RENAME_VALUE", {
      property: selectedProperty.value,
      oldValue: selectedValue.value,
      newValue: newValue.trim(),
    });
  }

  window.onmessage = createMessageHandler({
    INIT_PROPERTIES: (msg) => {
      const previousProperty = selectedProperty?.value;
      isLoading = false;
      errorMessage = "";
      propertiesData = msg.data;
      const propNames = Object.keys(propertiesData);
      propertyOptions = propNames.map((p) => ({ label: p, value: p }));

      if (propertyOptions.length > 0) {
        const preserved = propertyOptions.find((p) => p.value === previousProperty);
        selectedProperty = preserved || propertyOptions[0];
        valueOptions = propertiesData[selectedProperty.value].map((v) => ({
          label: v,
          value: v,
        }));
        selectedValue = valueOptions[0] || null;
        newValue = "";
      }
    },
    ERROR: (msg) => {
      isLoading = false;
      errorMessage = msg.message;
    },
  });
</script>

<div class="plugin-container">
  <PluginLayout>
    {#if isLoading}
      <EmptyState message="Select one or more component sets to begin..." />
    {:else if errorMessage}
      <EmptyState message={errorMessage} />
    {:else}
      <div class="form">
        <FieldGroup label="Property to change">
          <Dropdown
            menuItems={propertyOptions}
            bind:value={selectedProperty}
            placeholder="Select property"
          />
        </FieldGroup>

        <FieldGroup label="Value to rename">
          <Dropdown
            menuItems={valueOptions}
            bind:value={selectedValue}
            placeholder="Select value"
          />
        </FieldGroup>

        <FieldGroup label="New value">
          <Input bind:value={newValue} placeholder="Enter new value" />
        </FieldGroup>
      </div>
    {/if}
  </PluginLayout>

  <Footer variant="full">
    <Button
      variant="primary"
      on:click={handleRename}
      disabled={!selectedProperty || !selectedValue || !newValue.trim()}
    >
      Rename
    </Button>
  </Footer>
</div>

<style>
  .plugin-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--size-xsmall);
  }
</style>
