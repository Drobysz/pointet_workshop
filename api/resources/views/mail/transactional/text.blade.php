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

{!! $labels['product'] !!} | {!! $labels['quantity'] !!}
@foreach ($items as $item)
{!! implode(' · ', array_filter([$item['product_name'], $item['color_name'], $item['size']])) !!} | {{ $item['quantity'] }}
@endforeach

@if ($deliveryFee)
{!! $labels['delivery_fee'] !!} {{ $deliveryFee }}
@endif
{!! $labels['total'] !!} {{ $amount }}
@endif
@if ($delivery)

{!! $labels['delivery'] !!}
@if (! empty($delivery['name']))
{!! $delivery['name'] !!}
@endif
@if (! empty($delivery['address']))
{!! $delivery['address'] !!}
@endif
@endif
@if ($detailsUrl)

{!! $labels['details'] !!}
{!! $detailsUrl !!}
@endif

{!! __('transactional_mail.signature') !!}
