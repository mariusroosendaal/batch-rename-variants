<script>
  import { Button, Dropdown, Input, Label, Text } from "figma-ui3-kit-svelte";

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
    parent.postMessage(
      {
        pluginMessage: {
          type: "RENAME_VALUE",
          property: selectedProperty.value,
          oldValue: selectedValue.value,
          newValue: newValue.trim(),
        },
      },
      "*",
    );
  }

  window.onmessage = (event) => {
    const msg = event.data.pluginMessage;
    if (!msg) return;

    isLoading = false;
    errorMessage = "";

    if (msg.type === "INIT_PROPERTIES") {
      propertiesData = msg.data;
      const propNames = Object.keys(propertiesData);
      propertyOptions = propNames.map((p) => ({ label: p, value: p }));

      if (propertyOptions.length > 0) {
        selectedProperty = propertyOptions[0];
        valueOptions = propertiesData[selectedProperty.value].map((v) => ({
          label: v,
          value: v,
        }));
        if (valueOptions.length > 0) {
          selectedValue = valueOptions[0];
        }
      }
    } else if (msg.type === "ERROR") {
      errorMessage = msg.message;
    }
  };
</script>

<div class="wrapper">
  {#if isLoading}
    <div class="loading">
      <Text variant="body-medium" color="secondary">
        Select one or more component sets to begin...
      </Text>
    </div>
  {:else if errorMessage}
    <div class="error">
      <Text variant="body-medium" color="danger">{errorMessage}</Text>
    </div>
  {:else}
    <div class="form">
      <div class="field">
        <Label>Property to change:</Label>
        <Dropdown
          menuItems={propertyOptions}
          bind:value={selectedProperty}
          placeholder="Select property"
        />
      </div>

      <div class="field">
        <Label>Value to rename:</Label>
        <Dropdown
          menuItems={valueOptions}
          bind:value={selectedValue}
          placeholder="Select value"
        />
      </div>

      <div class="field">
        <Label>New value:</Label>
        <Input bind:value={newValue} placeholder="Enter new value" />
      </div>

      <Button
        variant="primary"
        on:click={handleRename}
        disabled={!selectedProperty || !selectedValue || !newValue.trim()}
      >
        Rename
      </Button>
    </div>
  {/if}
</div>

<style>
  .wrapper {
    padding: var(--size-xxsmall);
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .loading,
  .error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--size-xsmall);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--size-xxxsmall);
  }
</style>
