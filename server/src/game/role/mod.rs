macro_rules! make_role_enum {
    (
        $(
            $name:ident : $file:ident {
                $($data_ident:ident: $data_type:ty = $data_def:expr),*
            }
        ),*
    ) => {
        $(pub(crate) mod $file;)*

        #[derive(Clone, Copy, PartialEq, Debug, Serialize, Deserialize)]
        #[serde(rename_all = "camelCase")]
        pub enum Role {
            $($name),*
        }

        #[derive(Clone, PartialEq, Debug, Serialize, Deserialize)]
        #[serde(tag = "role", rename_all = "camelCase")]
        pub enum RoleState {
            $($name($name)),*
        }

        $(
            #[serde(rename_all = "camelCase")]
            #[derive(Clone, PartialEq, Debug, Serialize, Deserialize)]
            pub struct $name {
                $($data_ident: $data_type),*
            }
            impl Default for &name {
                fn default() -> Self {
                    Self{
                        $($data_ident : $data_def),*
                    }
                }
            }
        )*

        impl Role {  
            pub fn values() -> Vec<Role> {
                return vec![$(Role::$name),*];
            }
            pub fn default_data(&self) -> RoleState {
                match self {
                    $(Role::$name => RoleState::$name$({
                        $($data_ident: $data_def),*
                    })?),*
                }
            }
            
            pub fn suspicious(&self) -> bool {
                match self {
                    $(Role::$name => $file::SUSPICIOUS),*
                }
            }
            pub fn witchable(&self) -> bool {
                match self {
                    $(Role::$name => $file::WITCHABLE),*
                }
            }
            pub fn defense(&self) -> u8 {
                match self {
                    $(Role::$name => $file::DEFENSE),*
                }
            }
            pub fn roleblockable(&self) -> bool {
                match self {
                    $(Role::$name => $file::ROLEBLOCKABLE),*
                }
            }
            pub fn faction_alignment(&self) -> FactionAlignment {
                match self {
                    $(Role::$name => $file::FACTION_ALIGNMENT),*
                }
            }
            pub fn maximum_count(&self) -> Option<u8> {
                match self {
                    $(Role::$name => $file::MAXIUMUM_COUNT),*
                }
            }
            pub fn end_game_condition(&self) -> EndGameCondition {
                match self {
                    $(Role::$name => $file::END_GAME_CONDITION),*
                }
            }
            pub fn team(&self) -> Option<Team> {
                match self {
                    $(Role::$name => $file::TEAM),*
                }
            }

            pub fn do_night_action(&self, game: &mut Game, actor_ref: PlayerReference, priority: Priority) {
                match self {
                    $(Role::$name => $file::do_night_action(game, actor_ref, priority)),*
                }
            }
            pub fn do_day_action(&self, game: &mut Game, actor_ref: PlayerReference, target_ref: PlayerReference) {
                match self {
                    $(Role::$name => $file::do_day_action(game, actor_ref, target_ref)),*
                }
            }
            pub fn can_night_target(&self, game: &Game, actor_ref: PlayerReference, target_ref: PlayerReference) -> bool {
                match self {
                    $(Role::$name => $file::can_night_target(game, actor_ref, target_ref)),*
                }
            }
            pub fn can_day_target(&self, game: &Game, actor_ref: PlayerReference, target_ref: PlayerReference) -> bool {
                match self {
                    $(Role::$name => $file::can_day_target(game, actor_ref, target_ref)),*
                }
            }
            pub fn convert_targets_to_visits(&self,  game: &Game, actor_ref: PlayerReference, target_refs: Vec<PlayerReference>) -> Vec<Visit> {
                match self {
                    $(Role::$name => $file::convert_targets_to_visits(game, actor_ref, target_refs)),*
                }
            }
            pub fn get_current_send_chat_groups(&self,  game: &Game, actor_ref: PlayerReference) -> Vec<ChatGroup> {
                match self {
                    $(Role::$name => $file::get_current_send_chat_groups(game, actor_ref)),*
                }
            }
            pub fn get_current_recieve_chat_groups(&self,  game: &Game, actor_ref: PlayerReference) -> Vec<ChatGroup> {
                match self {
                    $(Role::$name => $file::get_current_recieve_chat_groups(game, actor_ref)),*
                }
            }
            pub fn on_phase_start(&self,  game: &mut Game, actor_ref: PlayerReference, phase: PhaseType){
                match self{
                    $(Role::$name => $file::on_phase_start(game, actor_ref, phase)),*
                }
            }
            pub fn on_role_creation(&self,  game: &mut Game, actor_ref: PlayerReference){
                match self{
                    $(Role::$name => $file::on_role_creation(game, actor_ref)),*
                }
            }
        }

        impl RoleState {
            pub fn role(&self) -> Role {
                match self {
                    $(RoleState::$name$({
                        $($data_ident: _),*
                    })? => Role::$name),*
                }
            }
        }
    }
}


use crate::game::player::PlayerReference;
use crate::game::visit::Visit;
use crate::game::Game;
use crate::game::end_game_condition::EndGameCondition;
use crate::game::chat::ChatGroup;
use crate::game::role_list::FactionAlignment;
use crate::game::phase::PhaseType;
use crate::game::team::Team;
use serde::{Serialize, Deserialize};
// Creates the Role enum
make_role_enum! {
    Jailor : jailor {
        executions_remaining: u8 = 3,
        jailed_target_ref: Option<PlayerReference> = None
    },

    Sheriff : sheriff {},
    Lookout : lookout {},

    Doctor : doctor {
        self_heals_remaining: u8 = 1,
        target_healed_ref: Option<PlayerReference> = None
    },
    Bodyguard : bodyguard {
        self_shields_remaining: u8 = 1,
        redirected_player_refs: Vec<PlayerReference> = Vec::new(),
        target_protected_ref: Option<PlayerReference> = None
    },

    Vigilante : vigilante {
        bullets_remaining: u8 = 3,
        will_suicide: bool = false
    },
    Veteran : veteran {
        alerts_remaining: u8 = 3,
        alerting_tonight: bool = false
    },

    Escort : escort {},
    Medium : medium {},
    Retributionist : retributionist {
        currently_used_player: Option<PlayerReference> = None,
        used_bodies: Vec<PlayerReference> = vec![]
    },

    Mafioso : mafioso {},
    
    Consort : consort {},
    Blackmailer : blackmailer {},

    Janitor : janitor {
        cleans_remaining: u8 = 3,
        cleaned_ref: Option<PlayerReference> = None
    },
    Framer : framer {},

    CovenLeader : coven_leader {},

    VoodooMaster : voodoo_master {},

    Jester : jester {
        lynched_yesterday: bool = false
    }
}

macro_rules! make_priority_enum {
    (
        $($name:ident),*
    )=>{
        #[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
        #[serde(rename_all = "camelCase")]
        pub enum Priority {
            $($name,)*
        }
        impl Priority {
            pub fn values() -> Vec<Self> {
                return vec![$(Self::$name),*];
            }
        }
    }
}
make_priority_enum! {
    TopPriority,
    Unswappable,
    Transporter,
    Control,
    Necromancy,

    Roleblock,
    Deception,

    Trickster,
    Bodyguard,

    Heal,
    Kill,
    Investigative,
    StealMessages
}

mod common_role;


/*
New Proposed priorities:

Top
    Jester(Kill), Vigilante(Suicide)
Unswappable
    Arsonist(Clear self), All decidedes (Vet decide)
    Ritualist, Doomsayer?
Transporter
    Transporter(Swap)
Controlls
    Witch(Swap), 
Necromany,
    Retributionist(Swap) Necromancer(Swap)
Roleblock
    Escort Consort Poisoner(roleblock)
Deception
    Arsonist(Douse), Werewolf(Make slef inno or sus)
    Blackmailer, Janitor(Clean), Forger(Yea)
    HexMaster(Hex), Enchanter(Alter/Enchant), Poisoner(Poison), Illusionist, Dreamweaver(Choose to dreamweave), VoodooMaster, Medusa
    Shroud(make harmful)
Trickster
    Trickster(Swap)
Bodyguard
    Bodyguard(Swap)
Heal
    Doctor, PotionMaster(Heal), Veteran(Heal self) Bodyguard(Heal self), PotionMaser(protect), Trapper(Build/Place/Protect), Crusader(Heal)
Kill
    Ambusher CovenLeader, Necronomicon, Arsonist(Ignite) HexMaster(Kill) Veteran(Kill) Poisoner(Kill) PotionMaser(kill) Trapper(kill)
    Jinx, Shroud(kill), Crusader(Kill) Jailor(Kill)
Investigative
    Sheriff, Investigator, Lookout, Tracker, Trapper(Investigate)
    Spy(Mafia/Coven visits + bug), Seer, Psychic, Coroner, Wildling
    Janitor(Who died) Bodyguard(Notif) Doctor(Notif) Arsonist(Who visited me) PotionMaser(reveal)
StealMessages
    Witch(steal messages)
    Retributionist(steal messages)
    Necromancer(steal messages)
    


*/