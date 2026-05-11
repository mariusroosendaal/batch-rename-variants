<script>
  import { Button, Dropdown, Input, Tooltip } from "figma-ui3-kit-svelte";
  import {
    PluginLayout,
    FieldGroup,
    EmptyState,
    Footer,
    sendToPlugin,
    createMessageHandler,
  } from "figma-plugin-utilities";

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
    selectedValue = valueOptions[0] ?? null;
  }

  $: renameDisabled = !selectedProperty || !selectedValue || !newValue.trim();

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
        const preserved = propertyOptions.find(
          (p) => p.value === previousProperty,
        );
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
      <EmptyState message={errorMessage} role="alert" />
    {:else}
      <div class="form">
        <FieldGroup label="Property to change">
          <Dropdown
            menuItems={propertyOptions}
            bind:value={selectedProperty}
            placeholder="Select property"
            ariaLabel="Property to change"
          />
        </FieldGroup>

        <FieldGroup label="Value to rename">
          <Dropdown
            menuItems={valueOptions}
            bind:value={selectedValue}
            placeholder="Select value"
            ariaLabel="Value to rename"
          />
        </FieldGroup>

        <FieldGroup label="New value" labelFor="new-value-input">
          <Input
            bind:value={newValue}
            placeholder="Enter new value"
            id="new-value-input"
          />
        </FieldGroup>
      </div>
    {/if}
  </PluginLayout>

  <Footer variant="full">
    {#if !isLoading && !errorMessage && renameDisabled}
      <Tooltip label="Enter a new value to rename">
        <Button variant="primary" on:click={handleRename} ariaDisabled
          >Rename</Button
        >
      </Tooltip>
    {:else}
      <Button
        variant="primary"
        on:click={handleRename}
        ariaDisabled={renameDisabled}>Rename</Button
      >
    {/if}
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
