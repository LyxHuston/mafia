use crate::game::chat::{ChatGroup, ChatMessage};
use crate::game::chat::night_message::NightInformation;
use crate::game::phase::PhaseType;
use crate::game::player::{Player, PlayerIndex};
use crate::game::role_list::FactionAlignment;
use crate::game::victory_group::VictoryGroup;
use crate::game::visit::Visit;
use crate::game::Game;

use super::Priority;

pub(super) const DEFENSE: u8 = 0;
pub(super) const ROLEBLOCKABLE: bool = true;
pub(super) const WITCHABLE: bool = true;
pub(super) const SUSPICIOUS: bool = false;
pub(super) const FACTION_ALIGNMENT: FactionAlignment = FactionAlignment::TownInvestigative;
pub(super) const MAXIUMUM_COUNT: Option<u8> = None;
pub(super) const VICTORY_GROUP: VictoryGroup = VictoryGroup::Faction;


pub(super) fn do_night_action(actor_index: PlayerIndex, priority: Priority, game: &mut Game) {
    if game.get_unchecked_player(actor_index).night_variables.roleblocked {return;}
    if priority != 8 {return;}

    if let Some(visit) = game.get_unchecked_player(actor_index).night_variables.visits.first(){
        let target_index = visit.target;
        let target = game.get_unchecked_mut_player(target_index);
        
        let message = ChatMessage::NightInformation { 
            night_information: NightInformation::SheriffResult { suspicious: target.night_variables.suspicious } 
        };
        
        game.get_unchecked_mut_player(actor_index).night_variables.night_messages.push( message );
    }
}
pub(super) fn can_night_target(actor_index: PlayerIndex, target_index: PlayerIndex, game: &Game) -> bool {
    actor_index != target_index &&
    game.get_unchecked_player(actor_index).night_variables.chosen_targets.len() < 1 &&
    game.get_unchecked_player(actor_index).alive && 
    game.get_unchecked_player(target_index).alive
}
pub(super) fn do_day_action(actor_index: PlayerIndex, game: &mut Game) {
    
}
pub(super) fn can_day_target(actor_index: PlayerIndex, target_index: PlayerIndex, game: &Game) -> bool {
    false
}
pub(super) fn convert_targets_to_visits(actor_index: PlayerIndex, targets: Vec<PlayerIndex>, game: &Game) -> Vec<Visit> {
    if targets.len() > 0{
        vec![Visit{ target: targets[0], astral: false, attack: false }]
    }else{
        Vec::new()
    }
}
pub(super) fn get_current_chat_groups(actor_index: PlayerIndex, game: &Game) -> Vec<ChatGroup> {
    if !game.get_unchecked_player(actor_index).alive{
        return vec![ChatGroup::Dead];
    }

    match game.phase_machine.current_state {
        crate::game::phase::PhaseType::Morning => vec![],
        crate::game::phase::PhaseType::Discussion => vec![ChatGroup::All],
        crate::game::phase::PhaseType::Voting => vec![ChatGroup::All],
        crate::game::phase::PhaseType::Testimony => {if game.player_on_trial == Some(actor_index) {vec![ChatGroup::All]} else {vec![]}},
        crate::game::phase::PhaseType::Judgement => vec![ChatGroup::All],
        crate::game::phase::PhaseType::Evening => vec![ChatGroup::All],
        crate::game::phase::PhaseType::Night => vec![],
    }
}
pub fn on_phase_start(actor_index: PlayerIndex, phase: PhaseType, game: &mut Game){
}