import "/output.css";
import $ from "jquery";

$(() => {
  const $submitForm = $("#submitForm");
  const $portInput = $("#port");
  const $routeInput = $("#route");
  const $fileInput = $("#fileInput");
  const $methodSelectInput = $("#methodSelect");
  const $responseContainer = $("#responseContainer");
  const $handleBody = $("#handleBody");
  const $handleHeader = $("#handleHeader");
  const $bodySection = $("#bodySection");
  const $headerSection = $("#headerSection");
  const $accessTokenInput = $("#accessToken");
  const $contentTypeSelectInput = $("#contentTypeSelect");

  $responseContainer.html('<p class="text-gray-500">Waiting for a request...</p>')

  const setVisibility = (elements, visibility) => {
    elements.toggleClass("hidden", !visibility);
  };

  const handleMethod = () => {
    setVisibility($(".isRequestWithData"), !($methodSelectInput.val() === "GET"));
  };

  const handleBodyToggle = () => {
    $bodySection.toggleClass("hidden");
  };

  const handleHeaderToggle = () => {
    $headerSection.toggleClass("hidden");
  };

  const handleFileChange = () => {
    $("#fileName").text(($fileInput[0]?.files[0]?.name || "No file selected"));
  };

  const handleAddProperty = () => {
    $("#propertiesContainer").append(`
      <div class="property-row flex gap-2 items-center">
        <input type="text" class="max-w-[30%] p-2 bg-zinc-700" placeholder="Property" title="Enter JSON property" />
        <input type="text" class="flex-1 p-2 bg-zinc-700" placeholder="Value" title="Enter JSON value" />
        <button class="remove-property max-w-[20%] p-2 bg-zinc-700 hover:bg-zinc-900 transition delete-property" title="Remove property">
          <img src="/trash.svg" class="min-w-[24px]" alt="Delete property from json body" />
        </button>
      </div>`);
  };

  const handleRemoveProperty = (e) => {
    $(e.target).closest(".property-row").remove();
  };

  const showResponse = (response) => {
      const jsonResponse = JSON.stringify(response, null, 2);
      $responseContainer.html(`<pre contenteditable="true" spellcheck="false" class="text-green-400 font-mono"><code>${jsonResponse}</code></pre>`);
    };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const port = $portInput.val().trim();
    const route = $routeInput.val().trim();

    const file = $fileInput[0]?.files[0] ?? null;
    const accessToken = $accessTokenInput.val().trim();

    if (!port || !route) {
      $responseContainer.text("Error: Port and route are required.");
      return;
    }

    try {
      const headers = {};

      let body = {};
      const formData = new FormData();

      const isRequestWithData = $methodSelectInput.val() !== "GET";

      if (isRequestWithData) {
        $("#propertiesContainer .property-row").each((_, element) => {
          const property = $(element).find("input").eq(0).val().trim();
          const value = $(element).find("input").eq(1).val().trim();

          if (property) body[property] = value;
        });

        if (file) formData.append("file", file);

        if ($contentTypeSelectInput.val() === "application/json") {
          body = JSON.stringify(body);
          headers["Content-Type"] = "application/json";
        } else {
          formData.append("data", JSON.stringify(body));
        }
      }

      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

      const response = await fetch(`http://localhost:${port}/${route}`, {
        method: $methodSelectInput.val(),
        body: isRequestWithData
          ? $contentTypeSelectInput.val() === "application/json"
            ? body
            : formData
          : null,
        headers: headers,
      });

      const jsonResponse = await response.json();
      showResponse(jsonResponse);

      $responseContainer.off("dblclick").on("dblclick", () => {
        navigator.clipboard
          .writeText(JSON.stringify(jsonResponse, null, 2))
          .then(() => alert("JSON copied to clipboard!"))
          .catch((error) => console.error("Failed to copy JSON: ", error));
      });
    } catch (error) {
      $responseContainer.html(`<p class="text-gray-500">Error making the request: ${error.message}</p>`);
    }
  };

  $handleBody.on("click", handleBodyToggle);
  $handleHeader.on("click", handleHeaderToggle);
  $methodSelectInput.on("change", handleMethod);

  $fileInput.on("change", handleFileChange);
  $(document).on("click", ".remove-property", handleRemoveProperty);

  $("#add-property").on("click", handleAddProperty);

  $submitForm.on("submit", handleSubmit);

  $(document).on("keydown", (event) => {
    if (event.ctrlKey && event.key === "Enter") {
      $submitForm.trigger("submit");
    }
  });

  handleMethod();
});
