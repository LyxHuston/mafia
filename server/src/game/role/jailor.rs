use std::collections::HashSet;

use serde::Serialize;

use crate::game::attack_power::{AttackPower, DefensePower};
use crate::game::chat::{ChatGroup, ChatMessageVariant};
use crate::game::components::detained::Detained;
use crate::game::resolution_state::ResolutionState;
use crate::game::grave::GraveKiller;
use crate::game::phase::PhaseType;
use crate::game::player::PlayerReference;

use crate::game::visit::Visit;
use crate::game::Game;

use super::{Priority, RoleState, Role, RoleStateImpl};


#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Jailor { 
    pub jailed_target_ref: Option<PlayerReference>, 
    executions_remaining: u8
}

impl Default for Jailor {
    fn default() -> Self {
        Self { 
            jailed_target_ref: None, 
            executions_remaining: 3
        }
    }
}


pub(super) const MAXIMUM_COUNT: Option<u8> = Some(1);
pub(super) const DEFENSE: DefensePower = DefensePower::None;

impl RoleStateImpl for Jailor {
    type ClientRoleState = Jailor;
    fn do_night_action(mut self, game: &mut Game, actor_ref: PlayerReference, priority: Priority) {


        match priority {
            Priority::Kill => {
                if let Some(visit) = actor_ref.night_visits(game).first() {
    
                    let target_ref = visit.target;
                    if Detained::is_detained(game, target_ref){
                        target_ref.try_night_kill_single_attacker(actor_ref, game, GraveKiller::Role(Role::Jailor), AttackPower::ProtectionPiercing, false);
        
                        self.executions_remaining = 
                            if target_ref.win_condition(game).requires_only_this_resolution_state(ResolutionState::Town) {0} else {self.executions_remaining - 1};
                        actor_ref.set_role_state(game, self);
                    }
                }
            },
            _ => {}
        }
    }
    fn can_select(self, game: &Game, actor_ref: PlayerReference, target_ref: PlayerReference) -> bool {
        !Detained::is_detained(game, actor_ref) &&
        Detained::is_detained(game, target_ref) &&
        self.jailed_target_ref.is_some_and(|p|p==target_ref) &&
        actor_ref.selection(game).is_empty() &&
        actor_ref != target_ref &&
        actor_ref.alive(game) &&
        target_ref.alive(game) &&
        game.phase_machine.day_number > 1 &&
        self.executions_remaining > 0
    }
    fn do_day_action(self, game: &mut Game, actor_ref: PlayerReference, target_ref: PlayerReference) {
        if let Some(old_target_ref) = self.jailed_target_ref {
            if old_target_ref == target_ref {
                actor_ref.set_role_state(game, RoleState::Jailor(Jailor { jailed_target_ref: None, ..self}));
            } else {
                actor_ref.set_role_state(game, RoleState::Jailor(Jailor { jailed_target_ref: Some(target_ref), ..self }));
            }
        } else {
            actor_ref.set_role_state(game, RoleState::Jailor(Jailor { jailed_target_ref: Some(target_ref), ..self }));
        }
    }
    fn can_day_target(self, game: &Game, actor_ref: PlayerReference, target_ref: PlayerReference) -> bool {        
        game.current_phase().is_day() &&
        actor_ref != target_ref &&
        actor_ref.alive(game) && target_ref.alive(game)
    }
    fn convert_selection_to_visits(self, game: &Game, actor_ref: PlayerReference, target_refs: Vec<PlayerReference>) -> Vec<Visit> {
        crate::game::role::common_role::convert_selection_to_visits(game, actor_ref, target_refs, true)
    }
    fn get_current_send_chat_groups(self, game: &Game, actor_ref: PlayerReference) -> HashSet<ChatGroup> {
        crate::game::role::common_role::get_current_send_chat_groups(game, actor_ref, 
            if PlayerReference::all_players(game).any(|p|Detained::is_detained(game, p)) {
                vec![ChatGroup::Jail].into_iter().collect()
            }else{
                vec![]
            }
        )
    }
    fn get_current_receive_chat_groups(self, game: &Game, actor_ref: PlayerReference) -> HashSet<ChatGroup> {
        let mut out = crate::game::role::common_role::get_current_receive_chat_groups(game, actor_ref);
        if 
            game.current_phase().is_night() &&
            actor_ref.alive(game) &&
            PlayerReference::all_players(game).any(|p|Detained::is_detained(game, p))
        {
            out.insert(ChatGroup::Jail);
        }
        out
    }
    fn on_phase_start(mut self, game: &mut Game, actor_ref: PlayerReference, phase: PhaseType){
        match phase {
            PhaseType::Night => {
                if let Some(jailed_ref) = self.jailed_target_ref {
                    if jailed_ref.alive(game) && actor_ref.alive(game){
                
                        Detained::add_detain(game, jailed_ref);
                        actor_ref.add_private_chat_message(game, 
                            ChatMessageVariant::JailedTarget{ player_index: jailed_ref.index() }
                        );
                    }else{
                        self.jailed_target_ref = None;
                        actor_ref.set_role_state(game, self);
                    }
                }
            },
            PhaseType::Obituary => {
                self.jailed_target_ref = None;
                actor_ref.set_role_state(game, self);
            },
            _ => {}
        }    
    }
}