// Copyright 2022 Pavel Nedrigailov
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const STORAGE_KEY = 'FGSFDS-BLACKLIST';
const DATA_KEY = `data-${STORAGE_KEY.toLowerCase()}`;
const generateBlackListId = (jobId) => `${STORAGE_KEY}-${jobId}`;
const generateButtonId = (jobId) => `button-${generateBlackListId(jobId)}`;
const generateJobContainerId = (jobId) => `container-${generateBlackListId(jobId)}`;
const createButtonContainer = (jobId) => {
	const buttonContainer = document.createElement('div');
	buttonContainer.id = generateButtonId(jobId);
	return buttonContainer;
}

const jobs = [...document.getElementsByClassName('m-jobsList__item')];

const switchElementsVisibility = (elements, visible) => {
	elements.forEach((element) => element.style.display = visible ? 'visible' : 'none')
}

const renderButton = (jobCard, jobId, visible) => {
	const actionsContainer = jobCard.getElementsByClassName('m-jobsListItem__userActionContainer')[0];
	if (!actionsContainer) return;

	const buttonText = visible ? '🗑 Hide' : '👁 Show';
	const buttonLabel = visible ? 'Add to black list' : 'Remove from black list';

	const buttonHtml = `
		<div class="m-jobsListItem__watchlistContainer">
			<div class="m-jobsListItem__watchlist">
				<div class="m-watchlistButton">
					<button 
						class="m-watchlistButton__button m-watchlistButton__button--linkStyle  m-watchlistButton__button--small"
						aria-label="${buttonLabel}"
					>
						<span class="m-watchlistButton__label m-watchlistButton__label--green" style="color: #3d0117">
							${buttonText}
						</span>
					</button>
				</div>
			</div>
		</div>
`

	const buttonContainer = document.getElementById(generateButtonId(jobId)) ?? createButtonContainer(jobId);

	buttonContainer.innerHTML = buttonHtml;
	const button = buttonContainer.getElementsByTagName('button')[0];
	button.addEventListener('click', () => visible ? addToBlacklist(jobId) : removeFromBlacklist(jobId));
	actionsContainer.insertAdjacentElement('beforeend', buttonContainer);
}
const renderJob = (jobId, visible, jobCard) => {
	if (!jobCard) jobCard = document.querySelector(`[${DATA_KEY}="${jobId}"]`);
	const wrap = [...jobCard.getElementsByClassName('m-jobsListItem__wrap')];
	switchElementsVisibility(wrap, visible);
	const snippet = [...jobCard.getElementsByClassName('m-jobsListItem__snippet')];
	switchElementsVisibility(snippet, visible);

	jobCard.style.background = visible ? 'unset' : '#80808078';
	jobCard.style.filter = visible ? 'unset' : 'grayscale(1)';

	renderButton(jobCard, jobId, visible);
}

const addToBlacklist = (jobId) => {
	chrome.storage.sync.get(STORAGE_KEY, (data) => {
		let blacklist = data[STORAGE_KEY] || [];
		if (blacklist.includes(jobId)) return;
		blacklist.push(jobId);
		chrome.storage.sync.set({[STORAGE_KEY]: blacklist});
		renderJob(jobId, false);
	});
}

const removeFromBlacklist = (jobId) => {
	chrome.storage.sync.get(STORAGE_KEY, (data) => {
		let blacklist = data[STORAGE_KEY] || [];
		blacklist = blacklist.filter((id) => id !== jobId);
		chrome.storage.sync.set({[STORAGE_KEY]: blacklist});
	});
	console.log('Removed from blacklist');
	chrome.storage.sync.get(STORAGE_KEY, (data) => {
		console.log(data[STORAGE_KEY]);
	}	);
	renderJob(jobId, true);
}

jobs.forEach(async (jobCard) => {
	const jobId = jobCard.getAttribute('data-gtm-item-id');
	jobCard.setAttribute(DATA_KEY, jobId);
	await chrome.storage.sync.get(STORAGE_KEY, (data) => {
		const blacklist = data[STORAGE_KEY] || [];
		const isBlacklisted = blacklist.includes(jobId);
		renderJob(jobId, !isBlacklisted, jobCard);
	})

})
