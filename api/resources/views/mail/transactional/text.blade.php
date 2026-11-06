{!! $greeting !!}

{!! implode("\n\n", $paragraphs) !!}

@if ($reference)
{!! $reference !!}
@endif
@if ($dateLabel)
{!! $dateLabel !!}{{ $deviceTime ? ' (UTC)' : '' }}
@endif
@if ($browser)
{!! __('transactional_mail.device.browser', ['browser' => $browser]) !!}
@endif
@if ($os)
{!! __('transactional_mail.device.os', ['os' => $os]) !!}
@endif
@if ($amount !== null)

{!! __('transactional_mail.preorder.product') !!} | {!! __('transactional_mail.preorder.quantity') !!}
@foreach ($items as $item)
{!! implode(' · ', array_filter([$item['product_name'], $item['color_name'], $item['size']])) !!} | {{ $item['quantity'] }}
@endforeach

{!! __('transactional_mail.preorder.total') !!} {{ $amount }}
@endif
@if ($detailsUrl)

{!! __('transactional_mail.preorder.details') !!}
{!! $detailsUrl !!}
@endif

{!! __('transactional_mail.signature') !!}
