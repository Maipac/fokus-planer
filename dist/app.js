const KEY='fokus-planer-tasks-v1';
const readTasks=()=>{try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value:[]}catch{return []}};
let tasks=readTasks();
let filter='all';
const save=()=>localStorage.setItem(KEY,JSON.stringify(tasks));
const dateLabel=date=>new Date(date).toLocaleDateString('de-DE',{day:'2-digit',month:'short'});
const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function renderList(list,items){
  if(!list)return;
  list.innerHTML=items.length?items.map(task=>`<li class="task-item ${task.done?'done':''}"><input class="task-check" type="checkbox" data-id="${escapeHtml(task.id)}" aria-label="${task.done?'Als offen markieren':'Als erledigt markieren'}: ${escapeHtml(task.title)}" ${task.done?'checked':''}><span class="task-title">${escapeHtml(task.title)}</span><span class="task-date">${dateLabel(task.created)}</span><button class="delete" type="button" data-delete="${escapeHtml(task.id)}" aria-label="${escapeHtml(task.title)} löschen">×</button></li>`).join(''):'<li class="empty">Hier ist noch Platz für deine nächste Aufgabe.</li>';
}
function render(){
  const done=tasks.filter(task=>task.done).length,open=tasks.length-done,percent=tasks.length?Math.round(done/tasks.length*100):0;
  document.querySelectorAll('[data-total]').forEach(el=>el.textContent=tasks.length);
  document.querySelectorAll('[data-done]').forEach(el=>el.textContent=done);
  document.querySelectorAll('[data-open]').forEach(el=>el.textContent=open);
  document.querySelectorAll('[data-percent]').forEach(el=>el.textContent=`${percent}%`);
  document.querySelectorAll('[data-progress]').forEach(el=>{el.style.width=`${percent}%`;el.parentElement.setAttribute('aria-valuenow',percent)});
  renderList(document.querySelector('#recent-list'),tasks.slice(0,5));
  renderList(document.querySelector('#task-list'),tasks.filter(task=>filter==='all'||(filter==='done'?task.done:!task.done)));
}
document.querySelectorAll('.task-form').forEach(form=>form.addEventListener('submit',event=>{
  event.preventDefault();const input=form.querySelector('input');const title=input.value.trim();if(!title)return;
  tasks.unshift({id:crypto.randomUUID(),title,done:false,created:new Date().toISOString()});save();input.value='';render();input.focus();
}));
document.addEventListener('change',event=>{if(!event.target.matches('.task-check'))return;const task=tasks.find(item=>item.id===event.target.dataset.id);if(task){task.done=event.target.checked;save();render()}});
document.addEventListener('click',event=>{
  const del=event.target.closest('[data-delete]');if(del){tasks=tasks.filter(task=>task.id!==del.dataset.delete);save();render();return}
  const button=event.target.closest('[data-filter]');if(button){filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(el=>{el.classList.toggle('active',el===button);el.setAttribute('aria-pressed',String(el===button))});render()}
});
const date=document.querySelector('[data-today]');if(date)date.textContent=new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
render();
