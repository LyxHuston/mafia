use crate::game::{components::{cult::Cult, mafia::Mafia}, phase::PhaseType, player::PlayerReference, Game};

#[must_use = "Event must be invoked"]
pub struct OnPhaseStart{
    phase: PhaseType
}
impl OnPhaseStart{
    pub fn new(phase: PhaseType) -> Self{
        Self{ phase }
    }
    pub fn invoke(self, game: &mut Game){
        for player_ref in PlayerReference::all_players(game){
            player_ref.on_phase_start(game, self.phase);
        }

        Mafia::on_phase_start(game, self.phase);
        Cult::on_phase_start(game, self.phase);

        game.on_phase_start(self.phase);
    }
}