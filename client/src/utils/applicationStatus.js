/**
 * Human-readable pipeline labels aligned with DB enum:
 * Applied | Shortlisted | In_Round | Selected | Rejected
 */
export function formatApplicationStatus(row) {
  if (!row) return '';
  const s = row.app_status || row.status;
  if (s === 'Shortlisted') {
    return 'Shortlisted for OA';
  }
  if (s === 'In_Round') {
    if (row.current_round_name && row.current_round_seq != null) {
      return `In round: ${row.current_round_name} (Round ${row.current_round_seq})`;
    }
    return 'In round';
  }
  if (s === 'Applied') return 'Applied';
  if (s === 'Selected') return 'Selected';
  if (s === 'Rejected') return 'Rejected';
  return String(s).replace(/_/g, ' ');
}

/**
 * Per-round timeline node: green = Cleared, red = Failed, yellow = active (OA / current round).
 * @param {object} round — includes round_id, sequence_number, result_status (from progress API)
 * @param {{ applicationStatus: string, currentRoundId: number|null, minSequence: number|null }} ctx
 */
export function roundNodeState(round, ctx) {
  const { applicationStatus, currentRoundId, minSequence } = ctx;
  const rs = round.result_status ?? null;
  if (rs === 'Cleared') return 'passed';
  if (rs === 'Failed') return 'failed';
  const curId = currentRoundId != null && currentRoundId !== '' ? Number(currentRoundId) : null;
  const rid = Number(round.round_id);
  if (applicationStatus === 'In_Round' && curId != null && !Number.isNaN(curId) && curId === rid) return 'current';
  if (applicationStatus === 'Shortlisted' && minSequence != null && Number(round.sequence_number) === Number(minSequence)) {
    return 'current';
  }
  return 'upcoming';
}
